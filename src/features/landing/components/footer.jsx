import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from "react-icons/fa";

const Footer = () => {
  return (
    <footer id="footer" className="footer-container mt-12 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="card-responsive w-full max-w-screen-xl bg-white rounded-xl shadow-md hover:shadow-xl transition flex flex-col md:flex-row overflow-hidden">
        {/* Columna izquierda */}
        <div className="w-full md:w-1/2 px-8 py-6 space-y-4">
          <img
            src="/images/logoNombre.png"
            alt="Logo Certimarcas"
            className="h-20 w-auto object-contain"
          />
          <p className="text-gray-700 text-sm text-left">
            Somos una empresa con más de 12 años de experiencia en propiedad industrial. Asesoramos y gestionamos el registro, certificación y protección de marcas a nivel nacional e internacional.
          </p>
          <div className="text-sm text-gray-500 space-y-3 text-left">
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-blue-700 text-sm flex-shrink-0 mt-0.5" />
              <p><strong>Dirección:</strong> Edificio La Ceiba, Local 329, Medellín, Colombia</p>
            </div>
            <div className="flex items-start gap-2">
              <FaPhone className="text-blue-700 text-sm flex-shrink-0 mt-0.5" />
              <p><strong>Teléfono:</strong> +57 301 518 5163</p>
            </div>
            <div className="flex items-start gap-2">
              <FaEnvelope className="text-blue-700 text-sm flex-shrink-0 mt-0.5" />
              <p><strong>Correo:</strong> jorgevanegas@certimarcas.com</p>
            </div>
            <div className="flex items-start gap-2">
              <FaClock className="text-blue-700 text-sm flex-shrink-0 mt-0.5" />
              <p><strong>Horario:</strong> Lunes a Viernes, 8:00am - 6:00pm</p>
            </div>
            <div className="flex items-start gap-2">
              <FaClock className="text-blue-700 text-sm flex-shrink-0 mt-0.5" />
              <p><strong>Atención Virtual:</strong> Disponible de manera permanente</p>
            </div>
          </div>
        </div>

        {/* Columna derecha: Mapa sin marco */}
        <div className="w-full md:w-1/2 h-[350px] md:h-auto overflow-hidden">
          <iframe
            title="Ubicación de Certimarcas"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.105743060737!2d-75.56839422459778!3d6.249795093738652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428f88b4de16d%3A0x45f359438a277bf0!2sEdificio%20La%20Ceiba!5e0!3m2!1ses!2sco!4v1750586091044!5m2!1ses!2sco"
            className="w-full h-full border-0 rounded-r-xl"
            style={{ 
              border: 'none !important',
              outline: 'none !important',
              boxShadow: 'none !important',
              margin: '0 !important',
              padding: '0 !important',
              display: 'block',
              transform: 'scale(1.01)',
              transformOrigin: 'top left'
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </footer>
  );
};

export default Footer;