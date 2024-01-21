
import { Link } from 'react-router-dom';


const ModeratorMenu = () => {
  const uloga = localStorage.getItem("uloga");je

  if (uloga !== "Moderator") {
    return null;
  }

  return (
    <nav className="navigacija">
    <ul>
      <li><Link to="/mojikorisnici">Moji korisnici</Link></li>
    </ul>
  </nav>
  );
};



export default ModeratorMenu;
