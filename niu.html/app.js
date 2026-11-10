const applicationModal = document.getElementById('modal');
const videoModal = document.getElementById('video-modal');
const campusVideo = document.getElementById('campus-video');
const mobileButton = document.getElementById('mobile-btn');
const mobileMenu = document.getElementById('mobile-menu');

function openModal() {
    applicationModal.classList.remove('hidden');
}

function closeModal() {
    applicationModal.classList.add('hidden');
}

function openVideoModal() {
    campusVideo.src = campusVideo.dataset.src;
    videoModal.classList.remove('hidden');
}

function closeVideoModal() {
    videoModal.classList.add('hidden');
    campusVideo.removeAttribute('src');
}

function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileButton.setAttribute('aria-expanded', 'false');
    mobileButton.setAttribute('aria-label', 'Open navigation menu');
}

window.openModal = openModal;
window.closeModal = closeModal;
window.openVideoModal = openVideoModal;
window.closeVideoModal = closeVideoModal;

mobileButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    mobileButton.setAttribute('aria-expanded', String(isOpen));
    mobileButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
});

document.querySelectorAll('[data-inquiry-course]').forEach((link) => {
    link.addEventListener('click', () => {
        document.getElementById('inquiry-course').value = link.dataset.inquiryCourse;
        const message = link.dataset.inquiryMessage;
        if (message) {
            document.getElementById('inquiry-message').value = message;
        }
    });
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal();
        closeVideoModal();
        closeMobileMenu();
    }
});

document.querySelectorAll('#application-form, #inquiry-form').forEach((form) => {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const submitButton = form.querySelector('button[type="submit"]');
        const status = form.querySelector('.form-status');
        const payload = Object.fromEntries(new FormData(form).entries());
        payload.type = form.id === 'application-form' ? 'application' : 'inquiry';
        submitButton.disabled = true;
        status.textContent = 'Sending your details to the local NIU server...';
        status.className = 'form-status text-sm text-gray-600';

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'The server could not save your request.');
            }

            status.textContent = result.message;
            status.className = 'form-status text-sm text-green-700';
            form.reset();
        } catch (error) {
            status.textContent = `${error.message} Please check the server is running and try again.`;
            status.className = 'form-status text-sm text-red-700';
        } finally {
            submitButton.disabled = false;
        }
    });
});

document.getElementById('current-year').textContent = String(new Date().getFullYear());

const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('hidden', window.scrollY < 500);
}, { passive: true });

backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
