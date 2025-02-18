document.addEventListener('DOMContentLoaded', function() {
    const menu = document.querySelector('.menu');
    const menuItems = document.querySelectorAll('.menu > ul > li');
    let currentIndex = 0;

    // Function to update active menu item (only called from game messages)
    function updateActiveItem(index) {
        // Remove active class from ALL menu items
        menuItems.forEach(item => {
            item.classList.remove('active');
            // Also remove active from any submenu items
            item.querySelectorAll('.submenu li').forEach(subItem => {
                subItem.classList.remove('active');
            });
        });
        
        // Add active class to the selected item
        if (menuItems[index]) {
            menuItems[index].classList.add('active');
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

    // Handle toggle switches through game only
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
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