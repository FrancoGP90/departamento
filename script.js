/* =========================================================
   Departamento en venta — interacciones del sitio
   Sin dependencias externas.
   ========================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setFooterYear();
    setupMobileNav();
    setupGalleryLightbox();
    setupContactForm();
  }

  /* ---------------------------------------------------------
     Año dinámico en el footer
     --------------------------------------------------------- */
  function setFooterYear() {
    var yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ---------------------------------------------------------
     Menú de navegación móvil
     --------------------------------------------------------- */
  function setupMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('primaryNav');
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    function openNav() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Cierra el menú al elegir un enlace (mejora la navegación en mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    // Cierra el menú con Escape
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Si se agranda la ventana a escritorio, restablece el estado del menú
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 860) {
        closeNav();
      }
    });
  }

  /* ---------------------------------------------------------
     Galería con visor ampliado (lightbox) accesible
     --------------------------------------------------------- */
  function setupGalleryLightbox() {
    var galleryButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var lightbox = document.getElementById('lightbox');
    if (!galleryButtons.length || !lightbox) return;

    var lightboxImage = document.getElementById('lightboxImage');
    var lightboxCaption = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    var backdrop = lightbox.querySelector('.lightbox-backdrop');

    var images = galleryButtons.map(function (btn) {
      var img = btn.querySelector('img');
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt'),
        staged: btn.getAttribute('data-staged') === 'true'
      };
    });

    var currentIndex = 0;
    var lastFocusedElement = null;

    function openLightbox(index) {
      currentIndex = index;
      lastFocusedElement = document.activeElement;
      updateLightboxImage();
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
      document.addEventListener('keydown', onKeyDown);
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    }

    function updateLightboxImage() {
      var current = images[currentIndex];
      lightboxImage.src = current.src;
      lightboxImage.alt = current.alt;
      var caption = 'Foto ' + (currentIndex + 1) + ' de ' + images.length;
      if (current.staged) {
        caption += ' · Foto ilustrativa (amoblada): el departamento se vende sin muebles.';
      }
      lightboxCaption.textContent = caption;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightboxImage();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightboxImage();
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        showPrev();
      } else if (event.key === 'ArrowRight') {
        showNext();
      } else if (event.key === 'Tab') {
        trapFocus(event);
      }
    }

    // Mantiene el foco dentro del visor mientras está abierto
    function trapFocus(event) {
      var focusable = lightbox.querySelectorAll(
        'button:not([disabled])'
      );
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    galleryButtons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);
  }

  /* ---------------------------------------------------------
     Validación del formulario de contacto (solo cliente)
     --------------------------------------------------------- */
  function setupContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var statusEl = document.getElementById('formStatus');

    var fields = {
      name: {
        input: document.getElementById('name'),
        errorEl: document.getElementById('name-error'),
        validate: function (value) {
          return value.trim().length >= 2 ? '' : 'Ingresá tu nombre y apellido.';
        }
      },
      email: {
        input: document.getElementById('email'),
        errorEl: document.getElementById('email-error'),
        validate: function (value) {
          var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return pattern.test(value.trim()) ? '' : 'Ingresá un email válido.';
        }
      },
      phone: {
        input: document.getElementById('phone'),
        errorEl: document.getElementById('phone-error'),
        validate: function (value) {
          if (value.trim() === '') return ''; // opcional: vacío es válido
          var digits = value.replace(/[^0-9]/g, '');
          return digits.length >= 8 ? '' : 'Ingresá un teléfono válido (mínimo 8 dígitos) o dejá el campo vacío.';
        }
      },
      message: {
        input: document.getElementById('message'),
        errorEl: document.getElementById('message-error'),
        validate: function (value) {
          return value.trim().length >= 10 ? '' : 'Contanos brevemente tu consulta (mínimo 10 caracteres).';
        }
      }
    };

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      field.input.addEventListener('blur', function () {
        validateField(key);
      });
      field.input.addEventListener('input', function () {
        // Limpia el error apenas el usuario corrige el campo
        if (field.input.closest('.form-field').classList.contains('has-error')) {
          validateField(key);
        }
      });
    });

    function validateField(key) {
      var field = fields[key];
      var errorMessage = field.validate(field.input.value);
      var wrapper = field.input.closest('.form-field');

      if (errorMessage) {
        wrapper.classList.add('has-error');
        field.input.setAttribute('aria-invalid', 'true');
        field.errorEl.textContent = errorMessage;
      } else {
        wrapper.classList.remove('has-error');
        field.input.removeAttribute('aria-invalid');
        field.errorEl.textContent = '';
      }

      return !errorMessage;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var isFormValid = Object.keys(fields)
        .map(validateField)
        .every(Boolean);

      if (!isFormValid) {
        statusEl.textContent = 'Revisá los campos marcados antes de enviar.';
        statusEl.className = 'form-status is-error';
        var firstInvalid = form.querySelector('.has-error input, .has-error textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Envío real vía FormSubmit (https://formsubmit.co), sin backend propio.
      // El endpoint AJAX se arma insertando "/ajax/" en la URL de "action" del <form>.
      // Para usar otro servicio o una API propia, alcanza con cambiar el "action" en
      // index.html y, si no expone una variante AJAX, ajustar esta URL.
      var ajaxEndpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
      var submitButton = form.querySelector('button[type="submit"]');

      submitButton.disabled = true;
      statusEl.textContent = 'Enviando consulta…';
      statusEl.className = 'form-status is-info';

      fetch(ajaxEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Respuesta no exitosa');
          statusEl.textContent = 'Consulta enviada correctamente. Te responderemos a la brevedad.';
          statusEl.className = 'form-status is-info';
          form.reset();
        })
        .catch(function () {
          statusEl.textContent = 'No se pudo enviar la consulta. Intentá nuevamente en unos minutos.';
          statusEl.className = 'form-status is-error';
        })
        .finally(function () {
          submitButton.disabled = false;
        });
    });
  }
})();
