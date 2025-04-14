class NewButton extends HTMLElement {
    // Define which attributes to observe
    static get observedAttributes() {
        return ['name', 'icon-class', 'button-class', 'styles', 'icon-and-text'];
    }

    constructor() {
        super();
        this.resizeObserver = null;
    }

    connectedCallback() {
        this.renderButton();

        // Observe changes in size
        this.setupResizeObserver();
    }

    // This method is called when an observed attribute changes
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
            this.renderButton();
        }
    }

    renderButton() {
        const name = this.getAttribute('name') || 'Chat';
        const styles = this.getAttribute('styles') || '';
        const iconClass = this.getAttribute('icon-class') || '';
        const buttonClass = this.getAttribute('button-class') || 'bg-chat-orange text-white';
        const iconAndText = this.getAttribute('icon-and-text') || 'false';

        const button = document.createElement('button');
        const icon = document.createElement('i');
        const text = document.createElement('span');

        button.className = `flex gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${buttonClass} ${styles}`;
        text.className = 'text'; // Control visibility in JS
        icon.className = `${iconClass} text-xl`; // Control visibility in JS

        text.textContent = name;
        button.appendChild(icon);
        button.appendChild(text);

        // Limpia el contenido previo del componente
        this.innerHTML = '';
        this.appendChild(button);

        // Check navbar state after rendering
        this.checkNavbarState();
    }

    setupResizeObserver() {
        // Cleanup any existing observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Create new observer
        this.resizeObserver = new ResizeObserver(() => {
            this.checkNavbarState();
        });

        this.resizeObserver.observe(this);

        // Listen for navbar state changes
        const navbar = this.closest('dynamic-navbar');
        if (navbar) {
            navbar.addEventListener('navbarPositionChange', () => this.checkNavbarState());
        }
    }

    checkNavbarState() {
        const button = this.querySelector('button');
        const text = this.querySelector('.text');
        const icon = this.querySelector('i');

        if (!button || !text || !icon) return;

        const iconAndText = this.getAttribute('icon-and-text') || 'false';

        // Verifica si estamos en un navbar
        const navbar = this.closest('dynamic-navbar');
        if (navbar) {
            // Check navbar position
            if (navbar._position === 'collapsed') {
                // Collapsed state (60px)
                text.style.display = 'none';
                icon.style.display = 'block';
                button.classList.add('w-10', 'h-10', 'p-0', 'justify-center');
                button.classList.remove('px-4', 'py-2', 'px-6', 'py-3');
                icon.classList.add('text-2xl');
            } else if (navbar._position === 'medium') {
                // Medium state (150px)
                text.style.display = 'none';
                icon.style.display = 'block';
                button.classList.add('justify-center');
                button.classList.remove('w-10', 'h-10', 'p-0');
                icon.classList.remove('text-2xl');

                // Re-apply original padding classes if they exist in styles
                const styles = this.getAttribute('styles') || '';
                if (styles.includes('px-6')) button.classList.add('px-6');
                if (styles.includes('py-3')) button.classList.add('py-3');
                if (!styles.includes('px-') && !styles.includes('py-')) {
                    button.classList.add('px-4', 'py-2'); // Default padding
                }
            } else {
                // Expanded state (506px)
                text.style.display = 'inline';

                // Si iconAndText es false, ocultar el icono en estado expandido
                if (iconAndText === "false") {
                    icon.style.display = 'none';
                } else {
                    icon.style.display = 'block';
                }

                button.classList.remove('justify-center', 'w-10', 'h-10', 'p-0');
                icon.classList.remove('text-2xl');

                // Re-apply original padding classes if they exist in styles
                const styles = this.getAttribute('styles') || '';
                if (styles.includes('px-6')) button.classList.add('px-6');
                if (styles.includes('py-3')) button.classList.add('py-3');
                if (!styles.includes('px-') && !styles.includes('py-')) {
                    button.classList.add('px-4', 'py-2'); // Default padding
                }
            }
        } else {
            // Not in a navbar, use width-based logic
            const width = this.getBoundingClientRect().width;
            if (width <= 200) {
                text.style.display = 'none';
                icon.style.display = 'block';
                button.classList.add('justify-center');
            } else {
                text.style.display = 'inline';

                // Si iconAndText es false, ocultar el icono cuando hay suficiente espacio
                if (iconAndText === "false") {
                    icon.style.display = 'none';
                } else {
                    icon.style.display = 'block';
                }

                button.classList.remove('justify-center');
            }
        }
    }

    disconnectedCallback() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        // Remove event listeners
        const navbar = this.closest('dynamic-navbar');
        if (navbar) {
            navbar.removeEventListener('navbarPositionChange', this.checkNavbarState);
        }
    }
}

// Register the custom element
customElements.define('new-btn', NewButton);