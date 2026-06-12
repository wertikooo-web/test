import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <Outlet />
    </main>
  );
}
