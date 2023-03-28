import axiosClient from '../services';
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import './Home.css'

const Home = ({triggerCartUpdate}) => {
    const { user, isAuthenticated, isLoading } = useAuth0();
    const [itemList, setItemList] = useState([]);  
    const [checkingInventory, setCheckingInventory] = useState(false);  
    const [error, setError] = useState('');
    const inventoryUrl = `${process.env.REACT_APP_API_SERVER_URL}/inventory`;
    const cartUrl = `${process.env.REACT_APP_API_SERVER_URL}/cart`;

    let getInventory = () => {    
        axiosClient.get(inventoryUrl)
            .then((result) => {
                setItemList([]);
                if (result.data != null) {
                    result.data
                        .map((item) => {
                            setItemList(itemList => [...itemList, item]);
                        });
                } else {
                    setCheckingInventory(false);
                }
            })
            .catch((error) => {   
                if (error.response.status !== 404) {
                    setError(error.response); 
                }        
                setCheckingInventory(false);
            });
    }

    const addCartItem = (item) => { 
        const params = {
          "email": user.email,
          "inventory_id": item._id
        };

        axiosClient.post(cartUrl, {}, { 
            params: params
        })
            .then((result) => {
                triggerCartUpdate();
            })
            .catch((error) => {   
                if (error.response.status !== 404) {
                    setError(error.response); 
                }  
                    
                setCheckingInventory(false);
            });
    }

    useEffect(() => {
        if (!checkingInventory && itemList.length === 0) {
            setCheckingInventory(true);
            setTimeout(() => { 
                getInventory(); 
            }, 200);
        } 
    }, [checkingInventory]);
    
    if (error.length > 0){
            <div className='main'>
            <div className='main-cart'>
                {JSON.stringify(error)}
            </div>
        </div>
    } else {
        if (itemList.length === 0) {
            return (
                <div className='main'>
                    <div className='main-cart'>
                        <p>No Records Found</p>
                    </div>
                </div>
            )
        } else {
            return (
                <div className='main'>
                    <div className='main-cart'>
                        <p>
                            <div>
                                <div className='table-div'>
                                    <div className='table-row-div'>
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
                                                    <FontAwesomeIcon className='pointer' icon={faPlus} onClick={() => { addCartItem(item); } } />
                                                </div>
                                            </div>
                                        ))
                                        }                                     
                                        </div>                                  
                                    </div>                            
                                </div>
                            </div>
                        </p>
                    </div>
                </div>
            );
        }
    }
}

export default Home;