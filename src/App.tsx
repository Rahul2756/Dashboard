import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { DataProcessing } from './pages/DataProcessing';
import { ProjectUpdate } from './pages/ProjectUpdate';
import { TranacUpdate } from './pages/TranacUpdate';
import { HiRATEStatus } from './pages/HiRATEStatus';

function App() {
  const [activeSection, setActiveSection] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());

  const handleRefresh = () => {
    // In a real app, this would re-parse the Excel file
    setLastUpdated(new Date().toLocaleString());
  };

  const renderContent = () => {
    switch (activeSection) {
      case 1:
        return <DataProcessing />;
      case 2:
        return <TranacUpdate refreshTrigger={lastUpdated} />;
      case 3:
        return <ProjectUpdate />;
      case 4:
        return <HiRATEStatus key={lastUpdated} />;
      default:
        return null;
    }
  };

  const getPageTitles = () => {
    switch (activeSection) {
      case 1:
        return {
          title: "1. Data Processing Team & Infrastructure",
          subtitle: "Overview of systems, seating capacity and people allocation"
        };
      case 2:
        return { 
          title: "2. TRaNac — Data Inflow & Processing Timeline", 
          subtitle: "Toll Plaza Survey Monitoring, Data Receipt & Processing Deadlines" 
        };
      case 3:
        return { title: "3. E-NEXCO Pavement Analysis Update", subtitle: "Pavement analysis status" };
      case 4:
        return { title: "4. HiRATE Status", subtitle: "Highway Signboard & Asset Rating Status" };
      default:
        return { title: "Status of TAR Works", subtitle: "Highway Engineering Operations Portal" };
    }
  };

  // If on landing page (activeSection === 0), display full-width landing page with no sidebar
  if (activeSection === 0) {
    return <LandingPage onNavigate={(id) => setActiveSection(id)} />;
  }

  const { title, subtitle } = getPageTitles();

  return (
    <div className="app-container">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="main-content">
        <Header 
          title={title} 
          subtitle={subtitle} 
          lastUpdated={lastUpdated} 
          onRefresh={handleRefresh}
          onBackToHome={() => setActiveSection(0)}
        />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
