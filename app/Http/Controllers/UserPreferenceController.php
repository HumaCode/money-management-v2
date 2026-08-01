<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\UserPreferenceUpdateRequest;
use App\Http\Resources\UserPreferenceResource;
use App\Services\UserPreferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class UserPreferenceController extends Controller
{
    protected UserPreferenceService $preferenceService;

    public function __construct(UserPreferenceService $preferenceService)
    {
        $this->preferenceService = $preferenceService;
    }

    public function index(Request $request)
    {
        $userId     = $request->user()->id;
        $preference = $this->preferenceService->getUserPreferences($userId);
        $currencies = $this->preferenceService->getAvailableCurrencies();

        return Inertia::render('Preferences/Index', [
            'title'       => 'Preferences',
            'subtitle'    => 'Customize your app layout, locale, and notifications',
            'preference'  => UserPreferenceResource::make($preference),
            'currencies'  => $currencies,
        ]);
    }

    public function update(UserPreferenceUpdateRequest $request)
    {
        $userId     = $request->user()->id;
        $preference = $this->preferenceService->updateUserPreferences($userId, $request->validated());

        if ($request->wantsJson()) {
            return ResponseHelper::success(
                UserPreferenceResource::make($preference),
                'Preferences updated successfully'
            );
        }

        return Redirect::route('preferences.index')->with('status', 'Preferences updated successfully.');
    }
}
