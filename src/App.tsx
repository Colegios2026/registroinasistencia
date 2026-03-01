import React from 'react';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { DocentePublico } from './pages/DocentePublico';
import { Inasistencias } from './pages/Inasistencias';
import { Pruebas } from './pages/Pruebas';
import { Inspectoria } from './pages/Inspectoria';
import { Estudiantes } from './pages/Estudiantes';
import { Configuracion } from './pages/Configuracion';
import { ToastContainer } from './components/ToastContainer';
import { Modal, Input, Button } from './components/ui';
import { useAuth } from './hooks/useAuth';
import { useToast } from './contexts/ToastContext';

function AppContent() {
  const [uiState, patchUiState] = React.useReducer(
    (
      state: { activeTab: string; isSidebarOpen: boolean; level: 'BASICA' | 'MEDIA' },
      patch: Partial<{ activeTab: string; isSidebarOpen: boolean; level: 'BASICA' | 'MEDIA' }>
    ) => ({ ...state, ...patch }),
    { activeTab: 'dashboard', isSidebarOpen: false, level: 'BASICA' }
  );
  const [authUiState, patchAuthUiState] = React.useReducer(
    (
      state: { isLoginOpen: boolean; email: string; password: string; loginLoading: boolean },
      patch: Partial<{ isLoginOpen: boolean; email: string; password: string; loginLoading: boolean }>
    ) => ({ ...state, ...patch }),
    { isLoginOpen: false, email: '', password: '', loginLoading: false }
  );
  const { activeTab, isSidebarOpen, level } = uiState;
  const { isLoginOpen, email, password, loginLoading } = authUiState;
  const { session, role, isStaff, isSuperuser, isAuthenticated, signIn, signOut, authError, setAuthError } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (!isStaff && activeTab !== 'docente_public') patchUiState({ activeTab: 'docente_public' });
    if (isStaff && activeTab === 'docente_public') patchUiState({ activeTab: 'dashboard' });
    if (!isSuperuser && activeTab === 'configuracion') patchUiState({ activeTab: 'dashboard' });
  }, [isStaff, isSuperuser, activeTab]);

  const content = React.useMemo(() => {
    if (!isStaff || activeTab === 'docente_public') {
      return <DocentePublico level={level} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard level={level} />;
      case 'inasistencias':
        return <Inasistencias level={level} />;
      case 'pruebas':
        return <Pruebas level={level} />;
      case 'inspectoria':
        return <Inspectoria level={level} />;
      case 'estudiantes':
        return <Estudiantes level={level} />;
      case 'configuracion':
        return isSuperuser ? <Configuracion /> : <Dashboard level={level} />;
      default:
        return <Dashboard level={level} />;
    }
  }, [activeTab, isStaff, isSuperuser, level]);

  const getTitle = () => {
    if (!isStaff || activeTab === 'docente_public') return 'Vista Docente';
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Docente';
      case 'inasistencias': return 'Gestión de Inasistencias';
      case 'pruebas': return 'Registro de Evaluaciones';
      case 'inspectoria': return 'Atención de Inspectoría';
      case 'estudiantes': return 'Fichas de Estudiantes';
      case 'configuracion': return 'Configuración';
      default: return 'Dashboard';
    }
  };

  const roleLabel = !isAuthenticated ? 'Docente público' : role === 'superuser' ? 'Superusuario' : role === 'staff' ? 'Staff' : 'Docente';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      patchAuthUiState({ loginLoading: true });
      const signedRole = await signIn(email.trim(), password);
      patchAuthUiState({ isLoginOpen: false, email: '', password: '' });
      if (signedRole === 'staff' || signedRole === 'superuser') {
        patchUiState({ activeTab: 'dashboard' });
        showToast({ type: 'success', message: `Sesión iniciada como ${signedRole === 'superuser' ? 'superusuario' : 'staff'}.` });
      } else {
        patchUiState({ activeTab: 'docente_public' });
        showToast({ type: 'info', message: 'Sesión iniciada con rol docente. Se habilita solo la vista docente.' });
      }
    } catch (error) {
      console.error('Login error', error);
      showToast({ type: 'error', message: 'No se pudo iniciar sesión. Verifica tus credenciales.' });
    } finally {
      patchAuthUiState({ loginLoading: false });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      patchUiState({ activeTab: 'docente_public' });
      showToast({ type: 'success', message: 'Sesión cerrada.' });
    } catch (error) {
      console.error('Logout error', error);
      showToast({ type: 'error', message: 'No se pudo cerrar sesión.' });
    }
  };

  return (
    <>
      <MainLayout
        activeTab={activeTab}
        setActiveTab={(tab) => patchUiState({ activeTab: tab })}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={(isOpen) => patchUiState({ isSidebarOpen: isOpen })}
        level={level}
        setLevel={(nextLevel) => patchUiState({ level: nextLevel })}
        title={getTitle()}
        isAuthenticated={isAuthenticated}
        isStaff={isStaff}
        isSuperuser={isSuperuser}
        roleLabel={roleLabel}
        userEmail={session?.user?.email}
        onLoginClick={() => {
          setAuthError(null);
          patchAuthUiState({ isLoginOpen: true });
        }}
        onLogoutClick={handleLogout}
      >
        {content}
      </MainLayout>
      <Modal isOpen={isLoginOpen} onClose={() => patchAuthUiState({ isLoginOpen: false })} title="Ingreso Staff" size="sm">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Correo"
            type="email"
            value={email}
            onChange={(e) => patchAuthUiState({ email: e.target.value })}
            placeholder="staff@colegio.cl"
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => patchAuthUiState({ password: e.target.value })}
            placeholder="••••••••"
            required
          />
          {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => patchAuthUiState({ isLoginOpen: false })}>Cancelar</Button>
            <Button type="submit" loading={loginLoading}>Ingresar</Button>
          </div>
        </form>
      </Modal>
      <ToastContainer />
    </>
  );
}

export default AppContent;
