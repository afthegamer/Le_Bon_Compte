import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Navigation component
 *
 * This component displays a dynamic navigation menu for the connected user.
 * The menu items are defined via the props, including a dynamic text incorporating email.
 *
 * @param {Object} props
 * @param {string} props.texteDuMenu - Text displayed in the button, for example "you are connected as a user@example.com".
 * @param {number|string|null} props.userId - User identifier.
 * @param {Array} props.menuItems - Table of menu elements (first section).
 * @param {Array} props.actionItems - Table of main actions (second section).
 */
const NavigationMenu = ({ texteDuMenu, userId, menuItems, actionItems }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    // Closes the menu if the user clicks outside the component
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={menuRef} className="relative">
            {/* Button to open/close the menu */}
            <button onClick={() => setOpen(!open)} className="flex items-center focus:outline-none">
                <span className="text-gray-700 mr-2">
                    {texteDuMenu}
                </span>
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Drop -down menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg py-4">
                    <div className="px-4 mb-4">
                        {menuItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className={`block ${item.textClass} hover:underline mb-2`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                    <div className="flex flex-col space-y-4 px-4">
                        {actionItems.map((item, index) => (
                            <a
                                key={index}
                                href={item.href}
                                className={`${item.className} text-white py-2 px-4 rounded-lg focus:ring-2 focus:ring-offset-2 text-center`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

NavigationMenu.propTypes = {
    texteDuMenu: PropTypes.string.isRequired,
    userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    menuItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
            textClass: PropTypes.string.isRequired,
        })
    ).isRequired,
    actionItems: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
            className: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default NavigationMenu;
