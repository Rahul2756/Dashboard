import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DataProcessing } from './pages/DataProcessing';
import { ProjectUpdate } from './pages/ProjectUpdate';
import { TranacUpdate } from './pages/TranacUpdate';
import { HiRATEStatus } from './pages/HiRATEStatus';
function App() {
  const [activeSection, setActiveSection] = useState(1);
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
        return <DataProcessing />;
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
        return { title: "Dashboard", subtitle: "Overview" };
    }
  };

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
        />
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
