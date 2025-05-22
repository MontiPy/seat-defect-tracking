import { useLocation } from 'react-router-dom';

function DefectsReviewScreen() {
    const location = useLocation();
    const project = location.state?.project;
  
    return (
      <div>
        <h2>Defects Review for {project}</h2>
        {/* TODO: Add logic to list/filter defects by project */}
      </div>
    );
  }
  
  export default DefectsReviewScreen;
  