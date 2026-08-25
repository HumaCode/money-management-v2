<?php

namespace App\Console\Commands;

use App\Models\Budget;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RolloverUnusedBudgets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'budget:rollover';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rollover unused budget remaining amounts to the next period for budgets with rollover_unused enabled';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting budget rollover check...');

        $now = Carbon::now();
        $count = 0;

        // Find active budgets with rollover_unused = true
        $budgets = Budget::where('is_active', true)
            ->where('rollover_unused', true)
            ->get();

        foreach ($budgets as $budget) {
            $isExpired = false;

            if ($budget->end_date) {
                // If end_date is in the past
                $isExpired = Carbon::parse($budget->end_date)->endOfDay()->isPast();
            } else {
                // If end_date is null, determine expiration based on created_at and period
                $createdAt = Carbon::parse($budget->created_at);
                $period = strtolower($budget->period ?? 'monthly');

                if ($period === 'weekly' && $createdAt->diffInDays($now) >= 7) {
                    $isExpired = true;
                } elseif ($period === 'monthly' && $createdAt->diffInMonths($now) >= 1) {
                    $isExpired = true;
                } elseif ($period === 'quarterly' && $createdAt->diffInMonths($now) >= 3) {
                    $isExpired = true;
                } elseif ($period === 'yearly' && $createdAt->diffInYears($now) >= 1) {
                    $isExpired = true;
                }
            }

            if ($isExpired) {
                DB::beginTransaction();
                try {
                    $remaining = max(0, (float) $budget->total_amount - (float) $budget->total_spent);

                    // Calculate next period dates
                    $period = strtolower($budget->period ?? 'monthly');
                    $oldStart = $budget->start_date ? Carbon::parse($budget->start_date) : $now->copy();
                    $oldEnd   = $budget->end_date ? Carbon::parse($budget->end_date) : $now->copy();

                    if ($period === 'weekly') {
                        $newStart = $oldEnd->copy()->addDay();
                        $newEnd   = $newStart->copy()->addDays(6);
                    } elseif ($period === 'quarterly') {
                        $newStart = $oldEnd->copy()->addDay();
                        $newEnd   = $newStart->copy()->addMonths(3)->subDay();
                    } elseif ($period === 'yearly') {
                        $newStart = $oldEnd->copy()->addDay();
                        $newEnd   = $newStart->copy()->addYear()->subDay();
                    } else { // monthly
                        $newStart = $oldEnd->copy()->addDay();
                        $newEnd   = $newStart->copy()->addMonth()->subDay();
                    }

                    // Deactivate old budget
                    $budget->update(['is_active' => false]);

                    // Create new budget period with carried over remaining amount added to total_amount
                    $baseAmount = (float) $budget->total_amount;
                    $newTotalAmount = $baseAmount + $remaining;

                    Budget::create([
                        'user_id'          => $budget->user_id,
                        'name'             => $budget->name,
                        'currency_id'      => $budget->currency_id,
                        'total_amount'     => $newTotalAmount,
                        'total_spent'      => 0,
                        'progress_percentage' => 0,
                        'period'           => $budget->period,
                        'start_date'       => $newStart->format('Y-m-d'),
                        'end_date'         => $newEnd->format('Y-m-d'),
                        'is_active'        => true,
                        'rollover_unused'  => true,
                        'notes'            => "Carried over {$remaining} unused budget from previous period.",
                    ]);

                    DB::commit();
                    $count++;

                    $this->info("Budget '{$budget->name}' (ID: {$budget->id}) rolled over: +{$remaining} carried forward to next period.");
                    Log::info("Budget '{$budget->name}' rolled over successfully. Carried over: {$remaining}");
                } catch (\Exception $e) {
                    DB::rollBack();
                    $this->error("Failed to rollover budget '{$budget->name}': {$e->getMessage()}");
                    Log::error("Budget rollover error for ID {$budget->id}: {$e->getMessage()}");
                }
            }
        }

        $this->info("Budget rollover process finished. Total budgets rolled over: {$count}");
        return 0;
    }
}
