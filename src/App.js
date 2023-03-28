import axiosClient from './services';
import { useAuth0 } from "@auth0/auth0-react";
import { Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { Home, Cart } from './components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faCircle } from '@fortawesome/free-solid-svg-icons';
import FadeIn from 'react-fade-in';
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { loginWithRedirect, getAccessTokenSilently, user, isAuthenticated } = useAuth0();
  const [searchParams] = useSearchParams();   
  const [cartCount, setCartCount] = useState(0);
  const [countSet, setCountSet] = useState(false);
  const [error, setError] = useState('');

  // #region Authentication
  const login = async () => {
      await loginWithRedirect({
          appState: {
              returnTo: "/",
          },
          authorizationParams: {
              prompt: "login",
              screen_hint: "signup",
              audience: process.env.REACT_APP_AUTH0_AUDIENCE
          },
      });
  }

  const checkLoginStatus = async () => {
      await getAccessTokenSilently({
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          scope: ['email'] 
      })
          .then((response) => {      
              if (searchParams.get('error')) {
                  alert(`Login Error: ${searchParams.get('error')}`);
              } else {
                  sessionStorage.setItem('auth0AccessToken', response);
              }          
          })
  }
  // #endregion 

  // #region local methods
  const handleNavigate = (url) => {
    navigate(url);
  }

  const triggerCartUpdate = () => {
    getCartCount();
  }

  const getCartCount = () => {    
    let url = `${process.env.REACT_APP_API_SERVER_URL}/cart`;

    if (user !== null) {
      const params = {
        "email": user.email
      };
    
      axiosClient.get(url, {
          params
        }).then((result) => {
            if (result.data != null) {               
                setCartCount(result.data[0].itemsArray.length);
            }
          })
          .catch((error) => {   
              if (error.response.status !== 404) {
                alert(JSON.stringify(error));
                setError(error.response); 
              }        
          })
          .finally(() => {
            setCountSet(true);
          });
    }
  }
  // #endregion 

  // #region Lifecycle Hooks
  useEffect(() => {
      if (!isAuthenticated || !sessionStorage.getItem('auth0AccessToken')) {
        checkLoginStatus();
      } else {
        if (!countSet) {
          getCartCount();
        }
      }
  }, [checkLoginStatus, isAuthenticated, countSet]);
  // #endregion

  return (
      <div className="App">
        <header className="App-header">
          <div>
            <div className="float-left pointer" onClick={() => { handleNavigate('/'); } }>
              Widgets - Shopping Cart
            </div>
            <div className="float-right">
              {user !== null && isAuthenticated && 
                <div>
                  Logged In: {user.email}
                </div>
              }
              {(user === null || !isAuthenticated) && 
                <div>
                  Logged Out: <span onClick={login} className="pointer">login</span>
                </div>
              }
              <div className="cart-icon-and-badge" onClick={() => { handleNavigate('/cart'); } }>
                  <FontAwesomeIcon className='pointer' icon={faCartShopping} />
                  {(cartCount > 0) &&
                    <FadeIn>
                      <FontAwesomeIcon className='circle-badge pointer' style={ { color: "red" } } icon={faCircle} onClick={() => { handleNavigate('/cart'); } } />
                      <div className="cart-count pointer">{cartCount}</div>
                    </FadeIn>
                  }
              </div>
            </div>
          </div>
        </header>      
        <div>      
          <div className='body-channel'>   
            <Routes>
              <Route path="/" element={ <Home triggerCartUpdate={triggerCartUpdate} /> }/>
              <Route path="/cart" element={ <Cart triggerCartUpdate={triggerCartUpdate} /> }/>
            </Routes>
          </div>
        </div>
      </div>
  );
}

export default App;
