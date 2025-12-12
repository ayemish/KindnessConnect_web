// src/components/SearchBar.jsx (New File)

import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    
    return (
        <div className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto mb-10">
            
            {/* Search Input Field */}
            <input
                type="text"
                placeholder="Search campaigns by title or keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            
        </div>
    );
};

export default SearchBar;