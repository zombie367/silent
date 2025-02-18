document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;

    // Disable all direct browser interactions
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
            e.preventDefault();
            return false;
        }
    });

    // Disable mouse clicks on menu items
    menuItems.forEach(item => {
        item.style.pointerEvents = 'none';
    });

    // Function to update active menu item (only called from game messages)
    function updateActiveItem(index) {
        // Remove active class from ALL menu items
        menuItems.forEach(item => {
            item.classList.remove('active');
            item.querySelectorAll('.submenu li').forEach(subItem => {
                subItem.classList.remove('active');
            });
        });
        
        // Add active class to the selected item
        if (menuItems[index]) {
            menuItems[index].classList.add('active');
            
            // Show submenu if exists
            const submenu = menuItems[index].querySelector('.submenu');
            if (submenu) {
                submenu.style.display = 'block';
            }
            
            menuItems[index].scrollIntoView({ block: 'nearest', behavior: 'auto' });
        }
    }

    // Only handle messages from the game
    window.addEventListener('message', function(event) {
        const data = event.data;

        if (data.type === 'forceUpdate' || data.type === 'setActive') {
            currentIndex = data.index;
            updateActiveItem(currentIndex);
        } else if (data.type === 'updateToggle') {
            const toggle = document.querySelector(`[data-action="${data.action}"] .toggle-switch`);
            if (toggle) {
                toggle.setAttribute('data-state', data.state ? 'on' : 'off');
            }
        }
    });

    // Only allow toggle interaction through game
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        const parent = toggle.parentElement;
        parent.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const action = this.getAttribute('data-action');
            fetch(`https://${GetParentResourceName()}/menuActivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item: action
                })
            });
        });
    });
}); 