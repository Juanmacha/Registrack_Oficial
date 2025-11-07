import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockDataService } from '../../../utils/mockDataService';
import NavBarLanding from '../../landing/components/landingNavbar';
import { useAuth } from '../../../shared/contexts/authContext';
import alertService from '../../../utils/alertService.js';
import { crearVenta } from '../../dashboard/pages/gestionVentasServicios/services/ventasService';
import DemoPasarelaPagoModal from '../../landing/components/DemoPasarelaPagoModal';

const CrearSolicitudPage = () => {
  const { servicioId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paso, setPaso] = useState(1);
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    expediente: '',
    tipoSolicitante: '',
    tipoPersona: '',
    tipoDocumento: '',
    numeroDocumento: '',
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoEntidad: '',
    razonSocial: '',
    nombreEmpresa: '',
    nit: '',
    pais: 'Colombia',
    nitMarca: '',
    nombreMarca: '',
    categoria: '',
    clases: [{ numero: '', descripcion: '' }],
    certificadoCamara: null,
    logotipoMarca: null,
    poderRepresentante: null,
    poderAutorizacion: null,
    fechaSolicitud: '',
    estado: 'En revisión',
    tipoSolicitud: '',
    encargado: 'Sin asignar',
    comentarios: []
  });

  const [mostrarPasarela, setMostrarPasarela] = useState(false);
  const [pagoDemo, setPagoDemo] = useState(null);

  const tiposDocumento = ['Cédula de Ciudadanía', 'Pasaporte', 'DNI', 'Tarjeta de Identidad', 'NIT'];
  const tiposEntidad = ['Sociedad Anónima', 'SAS', 'LTDA', 'Empresa Unipersonal', 'Otra'];
  const categorias = ['Productos', 'Servicios', 'Ambos'];
  const paisesFallback = ['Colombia', 'Perú', 'México', 'Argentina', 'Chile', 'Ecuador', 'Venezuela', 'Otro'];

  useEffect(() => {
    if (servicioId) {
      const servicioEncontrado = mockDataService.getServices().find(s => s.id === servicioId);
      setServicio(servicioEncontrado);
      setForm(prev => ({ ...prev, tipoSolicitud: servicioEncontrado?.nombre || '' }));
      setLoading(false);
    }
  }, [servicioId]);

  useEffect(() => {
    // Cargar datos del usuario si está autenticado
    // user ya está disponible desde useAuth
    if (user) {
      setForm(prev => ({
        ...prev,
        email: user.email || '',
        nombres: user.firstName || '',
        apellidos: user.lastName || '',
        numeroDocumento: user.documentNumber || ''
      }));
    }
  }, []);

  const siguientePaso = () => setPaso(prev => prev + 1);
  const pasoAnterior = () => setPaso(prev => prev - 1);

  const handleChange = e => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleClaseChange = (i, field, value) => {
    setForm(f => {
      const clases = [...f.clases];
      clases[i][field] = value;
      return { ...f, clases };
    });
  };

  const addClase = () => {
    if (form.clases.length < 25) {
      setForm(f => ({ ...f, clases: [...f.clases, { numero: '', descripcion: '' }] }));
    }
  };

  const removeClase = i => {
    setForm(f => ({ ...f, clases: f.clases.filter((_, idx) => idx !== i) }));
  };

  // Cambia el submit: ahora solo abre la pasarela demo
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = authData.getUser();
    if (!user || !user.email) {
      await alertService.error(
        "Error",
        "Debes iniciar sesión para crear una solicitud."
      );
      navigate('/login');
      return;
    }

    setMostrarPasarela(true); // Mostrar la pasarela demo antes de crear la solicitud
  };

  // Cuando el pago es exitoso, crea la solicitud
  const handlePagoExitoso = async (pago) => {
    setMostrarPasarela(false);
    setPagoDemo(pago);

    try {
      const user = authData.getUser();
      const datos = {
        ...form,
        email: user.email,
        fechaSolicitud: new Date().toISOString().slice(0, 10),
        certificadoCamara: form.certificadoCamara?.name || '',
        logotipoMarca: form.logotipoMarca?.name || '',
        poderRepresentante: form.poderRepresentante?.name || '',
        poderAutorizacion: form.poderAutorizacion?.name || '',
        estado: 'En revisión',
        encargado: 'Sin asignar',
        comentarios: []
      };

      await crearVenta(datos);

      await alertService.success(
        "Solicitud creada",
        `Tu solicitud de ${form.tipoSolicitud} ha sido creada exitosamente. Te contactaremos pronto.`
      );

      navigate('/misprocesos');
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      await alertService.error(
        "Error",
        "Hubo un problema al crear la solicitud. Por favor, intenta nuevamente."
      );
    }
  };

  const esTitular = form.tipoSolicitante === 'Titular';
  const esRepresentante = form.tipoSolicitante === 'Representante Autorizado';
  const esNatural = form.tipoPersona === 'Natural';
  const esJuridica = form.tipoPersona === 'Jurídica';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBarLanding />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBarLanding />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Servicio no encontrado</h2>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBarLanding />
      <div className="max-w-4xl mx-auto pt-[30px] p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-800 mb-2">{servicio.nombre}</h1>
            <p className="text-gray-600">{servicio.descripcion_corta}</p>
            <div className="mt-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                Paso {paso} de 5
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ...todos los pasos del formulario igual... */}

            {/* Navegación entre pasos */}
            <div className="flex justify-between pt-6 border-t">
              {paso > 1 ? (
                <button
                  type="button"
                  onClick={pasoAnterior}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Anterior
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  ← Volver
                </button>
              )}

              {paso < 5 ? (
                <button
                  type="button"
                  onClick={siguientePaso}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Siguiente →
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crear Solicitud
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      {/* Modal de pasarela demo */}
      <DemoPasarelaPagoModal
        isOpen={mostrarPasarela}
        onClose={() => setMostrarPasarela(false)}
        monto={servicio?.precio || 1000000}
        datosPago={{
          nombreMarca: form.nombreMarca,
          nombreRepresentante: form.nombres + ' ' + form.apellidos,
          tipoDocumento: form.tipoDocumento,
          numeroDocumento: form.numeroDocumento,
          // Puedes agregar más campos si tu pasarela los necesita
        }}
        onPagoExitoso={handlePagoExitoso}
      />
    </div>
  );
};

export default CrearSolicitudPage;