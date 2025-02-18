document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const scrollbarThumb = document.querySelector('.scrollbar-thumb');
    const scrollbarTrack = document.querySelector('.custom-scrollbar');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;

    // Disable all browser keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, true);

    // Disable mouse interaction
    menuItems.forEach(item => {
        item.style.pointerEvents = 'none';
        item.querySelector('a').style.pointerEvents = 'none';
    });

    // Scrollbar update function
    function updateScrollbar() {
        const scrollPercentage = menu.scrollTop / (menu.scrollHeight - menu.clientHeight);
        const maxThumbHeight = scrollbarTrack.clientHeight - 20;
        const thumbHeight = Math.min(
            maxThumbHeight,
            Math.max(40, (menu.clientHeight / menu.scrollHeight) * scrollbarTrack.clientHeight)
        );
        const maxPosition = scrollbarTrack.clientHeight - thumbHeight;
        const thumbPosition = Math.min(maxPosition, (maxPosition) * scrollPercentage);
        
        scrollbarThumb.style.height = `${thumbHeight}px`;
        scrollbarThumb.style.top = `${thumbPosition}px`;
    }

    // Only handle messages from FiveM
    window.addEventListener('message', function(event) {
        if (event.data.type === 'forceUpdate') {
            currentIndex = event.data.index;
            
            // Clear all active states
            menuItems.forEach(item => {
                item.classList.remove('active');
                item.style.backgroundColor = '';
                item.style.boxShadow = '';
            });

            // Set new active state
            const activeItem = menuItems[currentIndex];
            if (activeItem) {
                activeItem.classList.add('active');
                activeItem.style.backgroundColor = 'rgba(0, 102, 255, 0.2)';
                activeItem.style.boxShadow = '0 0 15px rgba(0, 102, 255, 0.3)';
                
                // Ensure item is visible
                activeItem.scrollIntoView({
                    behavior: 'auto',
                    block: 'nearest'
                });
            }
            
            updateScrollbar();
        }
    });

    // Initial setup
    updateScrollbar();
    menu.addEventListener('scroll', updateScrollbar);
}); 