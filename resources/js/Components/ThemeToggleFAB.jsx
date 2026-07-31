import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggleFAB() {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(nextTheme);
        localStorage.setItem('theme', nextTheme);
        
        if (nextTheme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle-fab"
            aria-label="Toggle Theme"
        >
            <style>{`
                .theme-toggle-fab {
                    position: fixed;
                    bottom: 32px;
                    left: 32px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(17, 24, 39, 0.8);
                    backdrop-filter: blur(12px);
                    color: #7dd3a8;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    z-index: 9998;
                    transition: all 0.3s ease;
                }
                
                html.light .theme-toggle-fab {
                    background: rgba(255, 255, 255, 0.8);
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    color: #059669;
                    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.08);
                }
                
                .theme-toggle-fab:hover {
                    transform: scale(1.08) translateY(-2px);
                }
                
                .theme-toggle-fab:active {
                    transform: scale(0.95);
                }
                
                .theme-icon-wrapper {
                    position: relative;
                    width: 22px;
                    height: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                
                .theme-toggle-fab:hover .theme-icon-wrapper {
                    transform: rotate(45deg);
                }
                
                .theme-icon {
                    position: absolute;
                    transition: transform 0.5s ease, opacity 0.5s ease;
                    width: 22px;
                    height: 22px;
                    stroke-width: 2;
                }
                
                .theme-icon.hide {
                    transform: scale(0) rotate(-90deg);
                    opacity: 0;
                    pointer-events: none;
                }
                
                .theme-icon.show {
                    transform: scale(1) rotate(0deg);
                    opacity: 1;
                }
            `}</style>
            
            <div className="theme-icon-wrapper">
                <Sun 
                    className={`theme-icon ${theme === 'light' ? 'show' : 'hide'}`} 
                />
                <Moon 
                    className={`theme-icon ${theme === 'dark' ? 'show' : 'hide'}`} 
                />
            </div>
        </button>
    );
}
