import React from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Custom hook to check if current logged-in user has permission for an action.
 * Developer / Dev roles automatically have permission for all actions.
 */
export function useCan() {
    const { auth } = usePage().props;

    const can = (permissionName) => {
        if (!auth || !auth.user) return false;

        const roles = auth.user.roles || [];
        const isDev = roles.includes('developer') || roles.includes('dev');
        if (isDev) return true;

        const permissions = auth.user.permissions || [];
        return permissions.includes(permissionName);
    };

    return { can };
}
