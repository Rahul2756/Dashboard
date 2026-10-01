import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DataProcessing } from './pages/DataProcessing';
import { UnderProgress } from './components/UnderProgress';

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
        return <UnderProgress title="2. TraNac Update" />;
      case 3:
        return <UnderProgress title="3. E-NEXCO Pavement Analysis Update" />;
      case 4:
        return <UnderProgress title="4. HiRATE Status" />;
      case 5:
        return <UnderProgress title="5. NTRO Report" />;
      case 6:
        return <UnderProgress title="6. Training Programme L0 Syllabus" />;
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
        return { title: "2. TraNac Update", subtitle: "Status and updates for TraNac" };
      case 3:
        return { title: "3. E-NEXCO Pavement Analysis Update", subtitle: "Pavement analysis status" };
      case 4:
        return { title: "4. HiRATE Status", subtitle: "Current status of HiRATE" };
      case 5:
        return { title: "5. NTRO Report", subtitle: "Monthly NTRO reporting" };
      case 6:
        return { title: "6. Training Programme L0 Syllabus", subtitle: "Training and syllabus updates" };
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
