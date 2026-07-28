/**
 * THE BLOOM SPACE — every user-facing string, in English and Spanish.
 *
 * Pages ship English inline in the HTML so crawlers and first paint get real
 * content with no JS. Each translatable node carries data-i18n="<key>";
 * lib/i18n.js swaps text when Spanish is chosen and sets <html lang>.
 *
 * The admin panel edits these strings through lib/api.mock.js, which layers
 * overrides on top of this file. Treat this as the seed content, not the
 * live copy, once the admin has been used.
 *
 * Keys are dot-namespaced by page. Keep both languages filled — lib/i18n.js
 * reports any key missing a Spanish value in the console during development.
 */

export const LOCALES = ['en', 'es'];
export const DEFAULT_LOCALE = 'en';

export const LOCALE_NAMES = { en: 'English', es: 'Español' };

export const content = {
  /* ---------------- global chrome ---------------- */
  'nav.home':       { en: 'Home',            es: 'Inicio' },
  'nav.space':      { en: 'The Space',       es: 'El Espacio' },
  'nav.gallery':    { en: 'Gallery',         es: 'Galería' },
  'nav.pricing':    { en: 'Pricing',         es: 'Precios' },
  'nav.faq':        { en: 'FAQ',             es: 'Preguntas' },
  'nav.contact':    { en: 'Contact',         es: 'Contacto' },
  'nav.book':       { en: 'Request a Viewing', es: 'Solicitar visita' },
  'nav.menu':       { en: 'Menu',            es: 'Menú' },
  'nav.skip':       { en: 'Skip to content', es: 'Saltar al contenido' },

  'lang.label':     { en: 'Language',        es: 'Idioma' },
  'lang.switchTo':  { en: 'Español',         es: 'English' },

  'footer.address':   { en: 'Visit',            es: 'Visítanos' },
  'footer.hours':     { en: 'Hours',            es: 'Horario' },
  'footer.connect':   { en: 'Connect',          es: 'Conecta' },
  'footer.maps':      { en: 'Open in Google Maps', es: 'Abrir en Google Maps' },
  'footer.byAppt':    { en: 'By appointment',   es: 'Con cita previa' },
  'footer.weekend':   { en: '7am–2pm, 4pm–11pm', es: '7am–2pm, 4pm–11pm' },
  'footer.rights':    { en: 'All rights reserved.', es: 'Todos los derechos reservados.' },
  'footer.madeIn':    { en: 'Made with care, in Visalia.', es: 'Hecho con cariño, en Visalia.' },

  /* ---------------- home ---------------- */
  'home.eyebrow':  { en: 'A boutique event room in Visalia',
                     es: 'Un salón de eventos boutique en Visalia' },
  /* Carries markup so the accent word keeps its rose italic in both
     languages — rendered with data-i18n-html. The accent sits on a different
     word in Spanish, which is exactly why it can't be a separate key. */
  'home.title':    { en: 'A space to <span class="accent-italic">bloom</span> together',
                     es: 'Un espacio para <span class="accent-italic">florecer</span> juntas' },
  'home.titlePlain': { en: 'A space to bloom together',
                       es: 'Un espacio para florecer juntas' },
  'home.lead':     { en: 'A bright white room with warm wood floors, dressed for your baby shower, bridal shower, quinceañera or workshop — and set with the kind of detail that makes a room feel considered.',
                     es: 'Un salón blanco y luminoso con pisos de madera cálida, preparado para tu baby shower, despedida de soltera, quinceañera o taller — y cuidado con los detalles que hacen que un espacio se sienta pensado.' },
  'home.statGuests':  { en: 'guests',        es: 'invitados' },
  'home.statFrom':    { en: 'from',          es: 'desde' },
  'home.statPerHour': { en: '/hr',           es: '/hora' },
  'home.statDays':    { en: 'days a week',   es: 'días a la semana' },
  'home.ctaPrimary':  { en: 'Request a Viewing', es: 'Solicitar visita' },
  'home.ctaSecondary':{ en: 'See Rates',     es: 'Ver precios' },
  'home.scrollCue':   { en: 'Scroll to what the room offers', es: 'Desplázate para ver el salón' },

  'home.welcomeEyebrow': { en: 'Welcome', es: 'Bienvenida' },
  'home.welcomeTitle':   { en: 'A room that feels like an exhale',
                           es: 'Un salón que se siente como un respiro' },
  'home.welcomeBody1':   { en: 'The Bloom Space exists because Visalia deserves a place where celebrations feel personal, not packaged. Every corner was chosen to make you feel held — from the warm wood floors to the way the light lands across the room by mid-afternoon.',
                           es: 'The Bloom Space existe porque Visalia merece un lugar donde las celebraciones se sientan personales, no prefabricadas. Cada rincón fue elegido para que te sientas acompañada — desde los pisos de madera cálida hasta cómo cae la luz a media tarde.' },
  'home.welcomeBody2':   { en: 'Whether you are planning a baby shower with twenty of your closest friends or a quinceañera that has been months in the making, this room meets you where you are. No venue minimums that do not make sense. Just a room ready for your vision.',
                           es: 'Ya sea que estés planeando un baby shower con veinte amigas cercanas o una quinceañera preparada durante meses, este salón se adapta a ti. Sin mínimos que no tengan sentido. Solo un espacio listo para tu visión.' },
  'home.welcomeBody3':   { en: 'Come see it in person. Viewings are by appointment only — that way the space is quiet, the light is right, and we can talk through exactly what you need.',
                           es: 'Ven a conocerlo en persona. Las visitas son solo con cita previa — así el espacio está tranquilo, la luz es la adecuada y podemos hablar de lo que necesitas.' },
  'home.pullLine':       { en: 'Room for sixty-five. Space for everything else.',
                           es: 'Espacio para sesenta y cinco. Y para todo lo demás.' },

  'home.perfectEyebrow': { en: 'Perfect For', es: 'Ideal para' },
  'home.perfectTitle':   { en: 'Celebrations both big and close',
                           es: 'Celebraciones grandes y cercanas' },

  'home.ratesTeaserEyebrow': { en: 'Rates', es: 'Precios' },
  'home.ratesTeaserTitle':   { en: 'Straightforward hourly pricing',
                               es: 'Precios por hora, claros' },
  'home.ratesTeaserBody':    { en: 'Every day of the week has its own rate and minimum. Nothing hidden, nothing bundled.',
                               es: 'Cada día tiene su propia tarifa y mínimo. Nada oculto, nada agrupado.' },
  'home.ratesTeaserCta':     { en: 'See full pricing', es: 'Ver precios completos' },

  'home.galleryTeaserEyebrow': { en: 'Gallery', es: 'Galería' },
  'home.galleryTeaserTitle':   { en: 'See the space', es: 'Conoce el espacio' },
  'home.galleryTeaserCta':     { en: 'View the gallery', es: 'Ver la galería' },

  'home.finalTitle': { en: 'Come see the room', es: 'Ven a conocer el salón' },
  'home.finalBody':  { en: 'Viewings are by appointment only. Send a request and we will get back to you within 24 hours.',
                       es: 'Las visitas son solo con cita previa. Envía una solicitud y te responderemos en 24 horas.' },

  /* ---------------- the space ---------------- */
  'space.metaTitle': { en: 'The Space — capacity, amenities and layouts',
                       es: 'El Espacio — capacidad, servicios y distribución' },
  'space.metaDesc':  { en: 'Specs for The Bloom Space in Visalia: 65 guest capacity, amenities, layout options, parking and load-in details.',
                       es: 'Detalles de The Bloom Space en Visalia: capacidad para 65 invitados, servicios, distribución, estacionamiento y acceso de carga.' },
  'space.eyebrow':   { en: 'The Space', es: 'El Espacio' },
  'space.title':     { en: 'Everything the room gives you',
                       es: 'Todo lo que el salón te ofrece' },
  'space.lead':      { en: 'One bright multipurpose room on Bridge Street, set up to suit the shape of your event rather than the other way around.',
                       es: 'Un salón multiusos luminoso en Bridge Street, preparado para adaptarse a tu evento y no al revés.' },

  'space.specsTitle':     { en: 'Specifications', es: 'Especificaciones' },
  'space.specCapacity':   { en: 'Capacity',       es: 'Capacidad' },
  'space.specCapacityV':  { en: 'Up to 65 guests', es: 'Hasta 65 invitados' },
  'space.specSeated':     { en: 'Seated',         es: 'Sentados' },
  'space.specSeatedV':    { en: 'Round or banquet tables', es: 'Mesas redondas o de banquete' },
  'space.specStanding':   { en: 'Standing',       es: 'De pie' },
  'space.specStandingV':  { en: 'Open floor reception', es: 'Recepción de pie' },
  'space.specHours':      { en: 'Hours',          es: 'Horario' },
  'space.specHoursV':     { en: 'Seven days a week', es: 'Siete días a la semana' },

  'space.amenitiesTitle': { en: 'Amenities', es: 'Servicios' },
  'space.amenitiesNote':  { en: 'Please confirm the amenity list with us when you book — we keep this page accurate rather than aspirational.',
                            es: 'Confirma la lista de servicios con nosotras al reservar — mantenemos esta página exacta, no aspiracional.' },

  'space.layoutTitle':    { en: 'Layout options', es: 'Opciones de distribución' },
  'space.layoutBanquet':  { en: 'Banquet', es: 'Banquete' },
  'space.layoutBanquetV': { en: 'Round tables with chairs, best for showers and quinceañeras where guests stay seated.',
                            es: 'Mesas redondas con sillas, ideal para showers y quinceañeras donde los invitados permanecen sentados.' },
  'space.layoutTheatre':  { en: 'Class / theatre', es: 'Clase / teatro' },
  'space.layoutTheatreV': { en: 'Rows facing a focal wall, best for workshops and community classes.',
                            es: 'Filas frente a una pared principal, ideal para talleres y clases comunitarias.' },
  'space.layoutOpen':     { en: 'Open floor', es: 'Piso abierto' },
  'space.layoutOpenV':    { en: 'Perimeter seating with the centre clear, best for receptions and mingling.',
                            es: 'Asientos en el perímetro con el centro despejado, ideal para recepciones y convivencia.' },

  'space.accessTitle':    { en: 'Parking and load-in', es: 'Estacionamiento y acceso de carga' },
  'space.accessParking':  { en: 'Parking', es: 'Estacionamiento' },
  'space.accessParkingV': { en: 'On-site parking is available, with additional street parking nearby for larger events.',
                            es: 'Hay estacionamiento en el sitio, con estacionamiento adicional en la calle para eventos grandes.' },
  'space.accessLoadIn':   { en: 'Load-in', es: 'Carga y descarga' },
  'space.accessLoadInV':  { en: 'Setup and teardown happen inside your booked hours, so build the time you need into the booking.',
                            es: 'El montaje y desmontaje ocurren dentro de tus horas reservadas, así que incluye ese tiempo al reservar.' },
  'space.accessAddress':  { en: 'Address', es: 'Dirección' },
  'space.accessCaption':  { en: 'The corner of Bridge Street — parking runs alongside the building.',
                            es: 'La esquina de Bridge Street — el estacionamiento corre junto al edificio.' },

  /* ---------------- gallery ---------------- */
  'gallery.metaTitle': { en: 'Gallery — see the room', es: 'Galería — conoce el salón' },
  'gallery.metaDesc':  { en: 'Photographs of The Bloom Space in Visalia, set for showers, quinceañeras, workshops and small receptions.',
                         es: 'Fotografías de The Bloom Space en Visalia, preparado para showers, quinceañeras, talleres y recepciones pequeñas.' },
  'gallery.eyebrow':   { en: 'Gallery', es: 'Galería' },
  'gallery.title':     { en: 'The room, dressed and bare',
                         es: 'El salón, decorado y vacío' },
  'gallery.lead':      { en: 'Photographs from past events and the room as it sits between bookings.',
                         es: 'Fotografías de eventos anteriores y del salón entre reservas.' },
  'gallery.openImage': { en: 'Open image', es: 'Abrir imagen' },
  'gallery.close':     { en: 'Close image viewer', es: 'Cerrar visor de imágenes' },
  'gallery.prev':      { en: 'Previous image', es: 'Imagen anterior' },
  'gallery.next':      { en: 'Next image', es: 'Imagen siguiente' },

  /* ---------------- pricing ---------------- */
  'pricing.metaTitle': { en: 'Pricing — hourly rates and minimums',
                         es: 'Precios — tarifas por hora y mínimos' },
  'pricing.metaDesc':  { en: 'Hourly rates for The Bloom Space in Visalia. Mon–Thu $65/hr, Fri $85/hr, Sat–Sun $100/hr, with day minimums and deposit policy.',
                         es: 'Tarifas por hora de The Bloom Space en Visalia. Lun–Jue $65/hora, Vie $85/hora, Sáb–Dom $100/hora, con mínimos y política de depósitos.' },
  'pricing.eyebrow':   { en: 'Pricing', es: 'Precios' },
  'pricing.title':     { en: 'Flexible pricing for every day of the week',
                         es: 'Precios flexibles para cada día de la semana' },
  'pricing.lead':      { en: 'All rates are hourly, with a minimum booking that varies by day.',
                         es: 'Todas las tarifas son por hora, con un mínimo de reserva que varía según el día.' },
  'pricing.perHour':   { en: '/ hr', es: '/ hora' },
  'pricing.minimum':   { en: 'minimum', es: 'mínimo' },
  'pricing.hourMin':   { en: 'hour', es: 'horas' },
  'pricing.noRestriction': { en: 'No time restrictions', es: 'Sin restricción de horario' },
  'pricing.windows':   { en: 'Booking windows', es: 'Horarios disponibles' },

  'pricing.calcTitle': { en: 'Estimate your booking', es: 'Calcula tu reserva' },
  'pricing.calcLead':  { en: 'Pick a date and hours to see the rate that applies. This is an estimate, not a reservation.',
                         es: 'Elige fecha y horas para ver la tarifa aplicable. Es una estimación, no una reserva.' },
  'pricing.calcDate':  { en: 'Date', es: 'Fecha' },
  'pricing.calcStart': { en: 'Start time', es: 'Hora de inicio' },
  'pricing.calcHours': { en: 'Hours', es: 'Horas' },
  'pricing.calcRate':  { en: 'Rate for this day', es: 'Tarifa de este día' },
  'pricing.calcSubtotal': { en: 'Estimated total', es: 'Total estimado' },
  'pricing.calcMinNote':  { en: 'This day has a minimum booking of', es: 'Este día tiene un mínimo de reserva de' },
  'pricing.calcDeposits': { en: 'Deposits are additional and are set when you book.',
                            es: 'Los depósitos son adicionales y se definen al reservar.' },
  'pricing.calcCta':      { en: 'Request this date', es: 'Solicitar esta fecha' },
  'pricing.calcOutside':  { en: 'That start time falls outside the booking windows for this day.',
                            es: 'Esa hora de inicio está fuera de los horarios disponibles para este día.' },
  'pricing.calcOverrun':  { en: 'Those hours run past the end of the booking window.',
                            es: 'Esas horas exceden el final del horario disponible.' },
  'pricing.calcBlocked':  { en: 'That time overlaps a standing hold on this day.',
                            es: 'Ese horario se cruza con una reserva fija de este día.' },

  'pricing.availTitle': { en: 'Availability', es: 'Disponibilidad' },
  'pricing.availLead':  { en: 'Standing holds are greyed out. Exact availability is confirmed by email within 24 hours.',
                          es: 'Las reservas fijas aparecen en gris. La disponibilidad exacta se confirma por correo en 24 horas.' },
  'pricing.availOpen':    { en: 'Open', es: 'Disponible' },
  'pricing.availLimited': { en: 'Partly held', es: 'Parcialmente ocupado' },
  'pricing.availBlocked': { en: 'Unavailable', es: 'No disponible' },
  'pricing.availPick':    { en: 'Select a date to see the hours we have open.',
                            es: 'Elige una fecha para ver las horas disponibles.' },
  'pricing.availHeld':    { en: 'Already held', es: 'Ya reservado' },

  'pricing.depositTitle': { en: 'A note about deposits', es: 'Sobre los depósitos' },
  'pricing.depositBody':  { en: 'A retainer deposit and a separate security deposit are both required to hold your date. Both deposits are non-refundable. The retainer reserves your date and time; the security deposit covers any incidental damage.',
                            es: 'Se requieren un depósito de retención y un depósito de seguridad por separado para apartar tu fecha. Ambos depósitos no son reembolsables. El depósito de retención aparta tu fecha y horario; el de seguridad cubre cualquier daño incidental.' },

  'pricing.soonTitle': { en: 'Online booking launching soon',
                         es: 'Reservas en línea muy pronto' },
  'pricing.soonBody':  { en: 'Card payment and instant confirmation are not live yet. For now every date is held by inquiry — send a request and we will confirm by email within 24 hours.',
                         es: 'El pago con tarjeta y la confirmación inmediata aún no están activos. Por ahora cada fecha se aparta por solicitud — envíanos una y confirmaremos por correo en 24 horas.' },

  /* ---------------- faq ---------------- */
  'faq.metaTitle': { en: 'FAQ — policies, deposits and booking',
                     es: 'Preguntas — políticas, depósitos y reservas' },
  'faq.metaDesc':  { en: 'Answers about deposits, cancellations, setup time, parking, alcohol, catering, capacity and what is included at The Bloom Space.',
                     es: 'Respuestas sobre depósitos, cancelaciones, montaje, estacionamiento, alcohol, comida, capacidad y qué incluye The Bloom Space.' },
  'faq.eyebrow':   { en: 'FAQ', es: 'Preguntas' },
  'faq.title':     { en: 'Everything you need to know', es: 'Todo lo que necesitas saber' },

  /* ---------------- contact ---------------- */
  'contact.metaTitle': { en: 'Request a Viewing', es: 'Solicitar una visita' },
  'contact.metaDesc':  { en: 'Request a viewing of The Bloom Space in Visalia. Viewings are by appointment only; we reply within 24 hours.',
                         es: 'Solicita una visita a The Bloom Space en Visalia. Las visitas son solo con cita previa; respondemos en 24 horas.' },
  'contact.eyebrow':   { en: 'Request a Viewing', es: 'Solicitar visita' },
  'contact.title':     { en: 'Reserve your time to see the space',
                         es: 'Aparta tu horario para conocer el espacio' },
  'contact.lead':      { en: 'Viewings are by appointment only. Fill out the form and we will get back to you within 24 hours to confirm.',
                         es: 'Las visitas son solo con cita previa. Llena el formulario y te responderemos en 24 horas para confirmar.' },

  'contact.photoCaption': { en: 'Look for the black door under the awning.',
                            es: 'Busca la puerta negra bajo el toldo.' },

  'form.firstName':  { en: 'First name', es: 'Nombre' },
  'form.lastName':   { en: 'Last name', es: 'Apellido' },
  'form.email':      { en: 'Email', es: 'Correo electrónico' },
  'form.phone':      { en: 'Phone', es: 'Teléfono' },
  'form.eventType':  { en: 'Event type', es: 'Tipo de evento' },
  'form.date':       { en: 'Preferred date', es: 'Fecha preferida' },
  'form.guests':     { en: 'Estimated guest count', es: 'Número estimado de invitados' },
  'form.time':       { en: 'Preferred time', es: 'Horario preferido' },
  'form.message':    { en: 'Anything else we should know?', es: '¿Algo más que debamos saber?' },
  'form.messagePlaceholder': { en: 'Tell us about your event, any questions, or special requests…',
                               es: 'Cuéntanos sobre tu evento, dudas o peticiones especiales…' },
  'form.selectOne':  { en: 'Select one…', es: 'Elige una opción…' },
  'form.submit':     { en: 'Send Request', es: 'Enviar solicitud' },
  'form.sending':    { en: 'Sending…', es: 'Enviando…' },
  'form.upTo':       { en: 'Up to 65', es: 'Hasta 65' },

  'form.eventBaby':      { en: 'Baby shower', es: 'Baby shower' },
  'form.eventBridal':    { en: 'Bridal shower', es: 'Despedida de soltera' },
  'form.eventQuince':    { en: 'Quinceañera', es: 'Quinceañera' },
  'form.eventBirthday':  { en: 'Birthday', es: 'Cumpleaños' },
  'form.eventWorkshop':  { en: 'Workshop / class', es: 'Taller / clase' },
  'form.eventReception': { en: 'Small reception', es: 'Recepción pequeña' },
  'form.eventShoot':     { en: 'Photo / content shoot', es: 'Sesión de fotos' },
  'form.eventCommunity': { en: 'Community gathering', es: 'Reunión comunitaria' },
  'form.eventOther':     { en: 'Other', es: 'Otro' },

  'form.timeMorning':   { en: 'Morning (7am – 12pm)', es: 'Mañana (7am – 12pm)' },
  'form.timeAfternoon': { en: 'Afternoon (12pm – 4pm)', es: 'Tarde (12pm – 4pm)' },
  'form.timeEvening':   { en: 'Evening (4pm – 11pm)', es: 'Noche (4pm – 11pm)' },

  'form.errFirstName': { en: 'Please enter your first name.', es: 'Por favor ingresa tu nombre.' },
  'form.errLastName':  { en: 'Please enter your last name.', es: 'Por favor ingresa tu apellido.' },
  'form.errEmail':     { en: 'Please enter a valid email address.', es: 'Por favor ingresa un correo válido.' },
  'form.errPhone':     { en: 'Please enter a phone number.', es: 'Por favor ingresa un teléfono.' },
  'form.errEventType': { en: 'Please select an event type.', es: 'Por favor elige un tipo de evento.' },
  'form.errDate':      { en: 'Please select a date.', es: 'Por favor elige una fecha.' },
  'form.errGuests':    { en: 'Please enter a number between 1 and 65.', es: 'Ingresa un número entre 1 y 65.' },

  'form.depositNotice': { en: 'Before you send: a retainer deposit and a separate security deposit are both required to hold a date, and both are non-refundable.',
                          es: 'Antes de enviar: se requieren un depósito de retención y un depósito de seguridad por separado para apartar una fecha, y ninguno es reembolsable.' },

  'form.successTitle': { en: 'Thank you!', es: '¡Gracias!' },
  'form.successBody':  { en: 'Your viewing request has been received. We will get back to you within 24 hours to confirm. Remember that a retainer deposit and a separate security deposit are both required to hold a date, and both are non-refundable.',
                         es: 'Hemos recibido tu solicitud de visita. Te responderemos en 24 horas para confirmar. Recuerda que se requieren un depósito de retención y un depósito de seguridad por separado para apartar una fecha, y ninguno es reembolsable.' },
  'form.rcNotice':     { en: 'Preview build — this request was saved locally in your browser and no email was sent.',
                         es: 'Versión de vista previa — esta solicitud se guardó localmente en tu navegador y no se envió ningún correo.' },
};

/** Event types, shared by the form and the admin inbox. */
export const EVENT_TYPES = [
  { value: 'baby-shower',   key: 'form.eventBaby' },
  { value: 'bridal-shower', key: 'form.eventBridal' },
  { value: 'quinceanera',   key: 'form.eventQuince' },
  { value: 'birthday',      key: 'form.eventBirthday' },
  { value: 'workshop',      key: 'form.eventWorkshop' },
  { value: 'reception',     key: 'form.eventReception' },
  { value: 'photoshoot',    key: 'form.eventShoot' },
  { value: 'community',     key: 'form.eventCommunity' },
  { value: 'other',         key: 'form.eventOther' },
];

/** Seeded FAQ. Editable in admin; both languages required. */
export const FAQ_ENTRIES = [
  {
    id: 'deposits',
    q: { en: 'How do deposits work?', es: '¿Cómo funcionan los depósitos?' },
    a: { en: 'A retainer deposit and a separate security deposit are both required to hold your date. Both deposits are non-refundable. The retainer reserves your date and time; the security deposit covers any incidental damage.',
         es: 'Se requieren un depósito de retención y un depósito de seguridad por separado para apartar tu fecha. Ambos depósitos no son reembolsables. El de retención aparta tu fecha y horario; el de seguridad cubre cualquier daño incidental.' },
  },
  {
    id: 'cancellation',
    q: { en: 'What is the cancellation policy?', es: '¿Cuál es la política de cancelación?' },
    a: { en: 'Because both deposits are non-refundable, cancelling means forfeiting them. If you need to reschedule, reach out and we will do our best based on availability, though rescheduling is not guaranteed.',
         es: 'Como ambos depósitos no son reembolsables, cancelar implica perderlos. Si necesitas cambiar la fecha, contáctanos y haremos lo posible según la disponibilidad, aunque no está garantizado.' },
  },
  {
    id: 'setup',
    q: { en: 'Can I arrive early for setup? What about teardown?', es: '¿Puedo llegar antes para montar? ¿Y el desmontaje?' },
    a: { en: 'Your rental time includes both setup and clean-up, so plan to have everything set up and taken down within your booked window. If you need extra time, let us know in advance and we can extend at the hourly rate if the schedule allows.',
         es: 'Tu tiempo de renta incluye el montaje y la limpieza, así que planea montar y desmontar dentro de tu horario reservado. Si necesitas más tiempo, avísanos con anticipación y podemos extenderlo a la tarifa por hora si la agenda lo permite.' },
  },
  {
    id: 'minimums',
    q: { en: 'Is there a minimum booking?', es: '¿Hay un mínimo de reserva?' },
    a: { en: 'Yes, and it varies by day. Monday through Thursday is a 3 hour minimum, Friday is 4 hours, and Saturday and Sunday are 5 hours.',
         es: 'Sí, y varía según el día. De lunes a jueves el mínimo es de 3 horas, el viernes 4 horas, y sábado y domingo 5 horas.' },
  },
  {
    id: 'weekend-windows',
    q: { en: 'Why are weekend hours split into two blocks?', es: '¿Por qué los fines de semana tienen dos bloques de horario?' },
    a: { en: 'Saturday and Sunday run 7:00am to 2:00pm and 4:00pm to 11:00pm, with a closed turnaround between them so the room can be reset properly between events.',
         es: 'Sábado y domingo van de 7:00am a 2:00pm y de 4:00pm a 11:00pm, con un intervalo cerrado entre ambos para poder preparar el salón adecuadamente entre eventos.' },
  },
  {
    id: 'bachata',
    q: { en: 'Is the room ever unavailable on a weekday?', es: '¿El salón alguna vez no está disponible entre semana?' },
    a: { en: 'Every Monday at 7:30pm the room is reserved for a weekly Bachata class. If you would like a Monday evening, plan around that slot.',
         es: 'Todos los lunes a las 7:30pm el salón está reservado para una clase semanal de bachata. Si quieres un lunes por la noche, considera ese horario.' },
  },
  {
    id: 'parking',
    q: { en: 'Is there parking?', es: '¿Hay estacionamiento?' },
    a: { en: 'Yes. On-site parking is available for guests, and there is additional street parking nearby for larger events. The venue is at 316 S Bridge St, Visalia.',
         es: 'Sí. Hay estacionamiento en el sitio para invitados, y estacionamiento adicional en la calle para eventos grandes. El salón está en 316 S Bridge St, Visalia.' },
  },
  {
    id: 'alcohol',
    q: { en: 'Can I serve alcohol?', es: '¿Puedo servir alcohol?' },
    a: { en: 'Yes, you may serve alcohol, provided none is sold on the premises. You are responsible for ensuring all guests are of legal drinking age.',
         es: 'Sí, puedes servir alcohol, siempre que no se venda en el lugar. Eres responsable de asegurar que todos los invitados tengan la edad legal para beber.' },
  },
  {
    id: 'catering',
    q: { en: 'Can I bring my own catering and decorations?', es: '¿Puedo traer mi propia comida y decoración?' },
    a: { en: 'Absolutely. You are welcome to bring your own food, drinks and decorations. We only ask that you avoid anything that could damage the walls, floors or furniture — no confetti, glitter or open flames without prior approval.',
         es: 'Por supuesto. Puedes traer tu propia comida, bebidas y decoración. Solo pedimos evitar cualquier cosa que dañe paredes, pisos o muebles — sin confeti, diamantina ni fuego abierto sin aprobación previa.' },
  },
  {
    id: 'cleaning',
    q: { en: 'Who is responsible for cleaning?', es: '¿Quién se encarga de la limpieza?' },
    a: { en: 'Basic clean-up is included in your rental time. We ask that you dispose of large trash items, wipe down surfaces and leave the space as you found it. Excessive mess or damage may be charged against the security deposit.',
         es: 'La limpieza básica está incluida en tu tiempo de renta. Pedimos que deseches la basura grande, limpies las superficies y dejes el espacio como lo encontraste. El desorden excesivo o los daños pueden cobrarse del depósito de seguridad.' },
  },
  {
    id: 'capacity',
    q: { en: 'What is the maximum capacity?', es: '¿Cuál es la capacidad máxima?' },
    a: { en: 'The Bloom Space comfortably accommodates up to 65 guests, seated or standing. For events with full tables and chairs we recommend adjusting the count slightly to allow comfortable movement.',
         es: 'The Bloom Space acomoda cómodamente hasta 65 invitados, sentados o de pie. Para eventos con mesas y sillas completas recomendamos ajustar un poco el número para permitir movimiento cómodo.' },
  },
  {
    id: 'viewings',
    q: { en: 'Can I see the room before booking?', es: '¿Puedo ver el salón antes de reservar?' },
    a: { en: 'Yes, and we encourage it. Viewings are by appointment only so the space is quiet and the light is right. Send a viewing request and we will reply within 24 hours.',
         es: 'Sí, y lo recomendamos. Las visitas son solo con cita previa para que el espacio esté tranquilo y con buena luz. Envía una solicitud y responderemos en 24 horas.' },
  },
];

/** Seeded "perfect for" list. */
export const PERFECT_FOR = [
  { id: 'showers',    en: 'Baby & bridal showers',  es: 'Baby showers y despedidas',
    enBody: 'Room for the whole family, with space for a dessert table and a backdrop that photographs well.',
    esBody: 'Espacio para toda la familia, con lugar para mesa de postres y un fondo que se ve bien en fotos.' },
  { id: 'quince',     en: 'Quinceañeras',           es: 'Quinceañeras',
    enBody: 'A room that holds a court, a dance floor and dinner without feeling crowded.',
    esBody: 'Un salón que acomoda chambelanes, pista de baile y cena sin sentirse lleno.' },
  { id: 'birthdays',  en: 'Birthdays',              es: 'Cumpleaños',
    enBody: 'From first birthdays to milestone years, set however the day needs to run.',
    esBody: 'Desde el primer añito hasta los años importantes, preparado como lo necesite el día.' },
  { id: 'workshops',  en: 'Workshops & classes',    es: 'Talleres y clases',
    enBody: 'Rows or tables, good light and a quiet street — suited to teaching and to community groups.',
    esBody: 'Filas o mesas, buena luz y una calle tranquila — ideal para enseñar y para grupos comunitarios.' },
  { id: 'receptions', en: 'Small receptions',       es: 'Recepciones pequeñas',
    enBody: 'An intimate alternative when a full banquet hall is more room than the day calls for.',
    esBody: 'Una alternativa íntima cuando un salón de banquetes completo es más de lo que el día necesita.' },
  { id: 'shoots',     en: 'Photo & content shoots', es: 'Sesiones de fotos y contenido',
    enBody: 'Consistent natural light and a clean backdrop for brand or portfolio work.',
    esBody: 'Luz natural constante y un fondo limpio para trabajo de marca o portafolio.' },
];

/** Seeded amenities. Kept modest on purpose — see space.amenitiesNote. */
export const AMENITIES = [
  { id: 'tables',   en: 'Tables and chairs', es: 'Mesas y sillas' },
  { id: 'restroom', en: 'Restroom facilities', es: 'Baños' },
  { id: 'climate',  en: 'Climate control', es: 'Climatización' },
  { id: 'prep',     en: 'Food prep area', es: 'Área de preparación de alimentos' },
  { id: 'parking',  en: 'On-site parking', es: 'Estacionamiento en el sitio' },
  { id: 'wifi',     en: 'WiFi', es: 'WiFi' },
];
