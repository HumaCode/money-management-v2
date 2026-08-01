<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\PasswordUpdateRequest;
use App\Http\Requests\ProfileUpdateRequest;
use App\Http\Resources\ProfileResource;
use App\Services\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ProfileController extends Controller
{
    protected ProfileService $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    /**
     * Display the user's profile form.
     */
    public function edit(Request $request)
    {
        $user = $this->profileService->getUserProfile($request->user()->id);

        return Inertia::render('Profile/Edit', [
            'title'    => 'User Profile',
            'subtitle' => 'Manage your account details and security settings',
            'user'     => ProfileResource::make($user),
            'status'   => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request)
    {
        $user = $this->profileService->updateProfileInformation(
            $request->user()->id,
            $request->validated()
        );

        if ($request->wantsJson()) {
            return ResponseHelper::success(
                ProfileResource::make($user),
                'Profile updated successfully'
            );
        }

        return Redirect::route('profile.edit')->with('status', 'Profile information updated successfully.');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(PasswordUpdateRequest $request)
    {
        $this->profileService->updatePassword(
            $request->user()->id,
            $request->validated()['password']
        );

        if ($request->wantsJson()) {
            return ResponseHelper::success(null, 'Password updated successfully');
        }

        return Redirect::route('profile.edit')->with('status', 'Password updated successfully.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $userId = $request->user()->id;

        Auth::logout();

        $this->profileService->deleteAccount($userId);

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
