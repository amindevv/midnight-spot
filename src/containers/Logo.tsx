import logo from '../resources/logo.svg'
const Logo = (props) => (
  <img
    style={{ height: 25, width: 25, marginRight: 2 }}
    alt="Logo"
    src={logo}
    {...props}
  />
);

export default Logo;
