import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumb — Reusable breadcrumb navigation component.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Dashboard', href: route('dashboard'), icon: <LayoutDashboard size={13} /> },
 *     { label: 'Master' },
 *     { label: 'Categories', icon: <FolderTree size={13} /> },
 *   ]} />
 *
 * Props:
 *   items  {Array}  — list of breadcrumb nodes
 *     item.label  {string}    — display text
 *     item.href   {string}    — if provided, renders as a link
 *     item.icon   {ReactNode} — optional icon before the label
 */
export default function Breadcrumb({ items = [] }) {
    if (!items.length) return null;

    return (
        <>
            <style>{`
                .bc-nav {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    flex-wrap: wrap;
                    padding: 0;
                    margin: 0 0 20px 0;
                    list-style: none;
                }

                /* Each crumb item */
                .bc-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-family: 'Inter', sans-serif;
                    font-size: 12.5px;
                    font-weight: 500;
                    line-height: 1;
                }

                /* Separator */
                .bc-sep {
                    color: var(--text-secondary);
                    opacity: 0.45;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                }

                /* Link crumb */
                .bc-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: var(--text-secondary);
                    text-decoration: none;
                    padding: 3px 8px;
                    border-radius: 6px;
                    transition: color 0.18s, background 0.18s;
                }
                .bc-link:hover {
                    color: var(--accent);
                    background: var(--accent-dim);
                }
                .bc-link svg { opacity: 0.8; }

                /* Active (last) crumb */
                .bc-current {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: var(--text-primary);
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 6px;
                    background: var(--bg-input);
                    border: 1px solid var(--bg-card-border);
                }
                .bc-current svg { color: var(--accent); }

                /* Light-mode */
                html.light .bc-link { color: #6b7280; }
                html.light .bc-link:hover { color: var(--accent); }
                html.light .bc-current {
                    color: #1f2937;
                    background: rgba(0,0,0,0.04);
                    border-color: rgba(0,0,0,0.1);
                }
            `}</style>

            <ol className="bc-nav" aria-label="breadcrumb">
                {items.map((item, idx) => {
                    const isLast = idx === items.length - 1;
                    const isFirst = idx === 0;

                    return (
                        <React.Fragment key={idx}>
                            <li className="bc-item">
                                {isLast ? (
                                    /* Current page — no link */
                                    <span className="bc-current" aria-current="page">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                ) : item.href ? (
                                    /* Clickable link */
                                    <Link href={item.href} className="bc-link">
                                        {item.icon || (isFirst && <Home size={13} />)}
                                        {item.label}
                                    </Link>
                                ) : (
                                    /* Non-clickable group label */
                                    <span className="bc-link" style={{ cursor: 'default', pointerEvents: 'none' }}>
                                        {item.icon}
                                        {item.label}
                                    </span>
                                )}
                            </li>

                            {/* Separator — only between items */}
                            {!isLast && (
                                <li className="bc-sep" aria-hidden="true">
                                    <ChevronRight size={12} />
                                </li>
                            )}
                        </React.Fragment>
                    );
                })}
            </ol>
        </>
    );
}
