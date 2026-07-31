<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'name'              => $this->name,
            'slug'              => $this->slug,
            'type'              => $this->type,
            'icon'              => $this->icon,
            'color'             => $this->color,
            'description'       => $this->description,
            'is_active'         => $this->is_active,
            'is_system'         => $this->is_system,
            'is_custom'         => $this->is_custom,
            'has_children'      => $this->has_children,
            'full_name'         => $this->full_name,

            // Relationships (conditional loading)
            'parent'            => $this->whenLoaded('parent', function () {
                return [
                    'id'    => $this->parent->id,
                    'name'  => $this->parent->name,
                    'type'  => $this->parent->type,
                ];
            }),

            'children'          => $this->whenLoaded('children', function () {
                return          CategoryResource::collection($this->children);
            }),

            'user'              => $this->whenLoaded('user', function () {
                return [
                    'id'    => $this->user->id,
                    'name'  => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),

            // Statistics (optional)
            'transactions_count' => $this->when(
                isset($this->transactions_count),
                $this->transactions_count
            ),

            'total_amount'      => $this->when(
                isset($this->total_amount),
                $this->total_amount
            ),

            // Timestamps
            'created_at'        => tgl_indo_time($this->created_at, true),
            'updated_at'        => tgl_indo_time($this->updated_at, true),
        ];
    }
}
