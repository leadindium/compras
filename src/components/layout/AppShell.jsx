import BottomTabs from './BottomTabs'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="max-w-lg mx-auto">
        {children}
      </main>
      <BottomTabs />
    </div>
  )
}
