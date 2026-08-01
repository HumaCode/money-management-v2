<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryRole = $this->roles->first();

        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'username'      => $this->username,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'gender'        => $this->gender,
            'avatar'        => $this->avatar ? asset('storage/' . $this->avatar) : null,
            'is_active'     => (bool) $this->is_active,
            'role_name'     => $primaryRole ? $primaryRole->name : 'No Role',
            'role_slug'     => $primaryRole ? $primaryRole->slug : 'user',
            'role_color'    => $primaryRole ? $primaryRole->color : '#3b82f6',
            'last_login_at' => $this->last_login_at ? tgl_indo_time($this->last_login_at, true) : 'Belum pernah login',
            'created_at'    => tgl_indo($this->created_at, true),
        ];
    }
}
