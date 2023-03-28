import axiosClient from '../services';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faCircle } from '@fortawesome/free-solid-svg-icons';
import './Cart.css'
import '../App.css'

const Cart = ({triggerCartUpdate}) => {
    const [itemList, setItemList] = useState([]);  
    const [gettingCart, setGettingCart] = useState(false);  
    const { isAuthenticated, user, isLoading } = useAuth0();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const url = `${process.env.REACT_APP_API_SERVER_URL}/cart`;

    let handleNavigate = (url) => {
      navigate(url);
    }

    const getCart = () => {
        const params = {
          "email": user.email
        };
    
        axiosClient.get(url, { 
            params 
        }).then((result) => {
                setItemList([]);
                if (result.data != null) {
                    result.data[0].itemsArray
                        .map((item) => {
                            setItemList(itemList => [...itemList, item]);
                        });
                } else {
                    setGettingCart(false);
                }
            })
            .catch((error) => {   
                if (error.response.status !== 404) {
                    setError(error.response); 
                }        
                setGettingCart(false);
            });

    }

    const deleteCartItem = (item) => {
        const params = {
          "email": user.email,
          "inventory_id": item._id
        };
    
        axiosClient.delete(url, { 
            params 
        })
            .then((result) => {
                setItemList([]);
                if (result.data != null) {
                    result.data[0].itemsArray
                        .map((item) => {
                            setItemList(itemList => [...itemList, item]);
                        });
                    triggerCartUpdate();
                } else {
                    setGettingCart(false);
                }
            })
            .catch((error) => {   
                if (error.response.status !== 404) {
                    setError(error.response); 
                }        
                setGettingCart(false);
            });

    }

    useEffect(() => {    
        if (!isLoading) {
            if(!isAuthenticated) {
                handleNavigate('/');           
            } else {
                if (!gettingCart) {
                    getCart();
                }
            }
        }   
    }, [isAuthenticated]);

    if (isLoading) {
        return <div>Loading ...</div>;
    }
    
    if (!isLoading && isAuthenticated && typeof(user) !== undefined) {
        if (itemList.length > 0 && isAuthenticated){
            return (
                <div className="cart-main">
                    <div className="cart-greeting">
                        {user.name}, here is your Shopping Cart
                    </div>
                    <div className="cart-grid">
                        <div className="table-div">
                            <div className="table-row-div">
                                <div className='table-cell-div'>
                                    <div className='table-header-group-div'>
                                        <div className='table-cell-div'>name</div>
                                        <div className='table-cell-div'>description</div>
                                        <div className='table-cell-div'></div>
                                    </div>  
                                {
                                itemList.map((item) => (
                                    <div className='table-row-div'>
                                        <div className='table-cell-div'>{item.name}</div>
                                        <div className='table-cell-div'>{item.description}</div>
                                        <div className='table-cell-div'>
                                            <FontAwesomeIcon className='pointer' icon={faTrashCan} onClick={() => { deleteCartItem(item); } } />
                                        </div>
                                    </div>
                                ))
                                }                                     
                                </div>                      
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="cart-main">
                    <div className="cart-greeting">
                        {user.name}, your shopping cart is empty.
                    </div>
                </div>
            )
        }
    }
}

export default Cart;