import { Link } from 'react-router-dom';
import './AdminMenu.css'; 

const AdminMenu = () => {
  const uloga = localStorage.getItem("uloga"); 

  if (uloga !== "Administrator") {
    return null;
  }

  return (
    <nav className="navigacija">
    <ul>
      <li><Link to="/korisnici">Svi korisnici</Link></li>
      <li><Link to="/mojikorisnici">Moji korisnici</Link></li>
    </ul>
  </nav>
  );
};

export default AdminMenu ;
