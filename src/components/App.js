import React from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import { useState, useEffect } from 'react';

import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmDeletePopup from './ConfirmDeletePopup';
import ImagePopup from './ImagePopup';
import api from '../utils/api';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
	const [ currentUser, setCurrentUser ] = useState({});

	const [ isEditProfilePopupOpen, setIsEditProfilePopupOpen ] = useState(false);
	const [ isAddPlacePopupOpen, setIsAddPlacePopupOpen ] = useState(false);
	const [ isEditAvatarPopupOpen, setIsEditAvatarPopupOpen ] = useState(false);
	const [ isImagePopupOpen, setIsImagePopupOpen ] = useState(false);
	const [ isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen ] = useState(false);
	const [ selectedCard, setSelectedCard ] = useState({});
	const [ cards, setCards ] = useState([]);
	const [ cardToDelete, setCardToDelete ] = useState({});

	useEffect(() => {
		Promise.all([ api.getUser(), api.getInitialCards() ])
			.then(([ userData, cardsData ]) => {
				setCurrentUser(userData);
				setCards(cardsData);
			})
			.catch((err) => {
				console.error(err);
			});
	}, []);

	function handleEditProfileClick() {
		setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
	}

	function handleAddPlaceClick() {
		setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
	}

	function handleEditAvatarClick() {
		setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
	}

	function handleCardClick(choosenCard) {
		setSelectedCard(choosenCard);
		setIsImagePopupOpen(true);
	}

	function closeAllPopups() {
		setIsEditProfilePopupOpen(false);
		setIsAddPlacePopupOpen(false);
		setIsEditAvatarPopupOpen(false);
		setIsImagePopupOpen(false);
		setIsConfirmDeletePopupOpen(false);
		setSelectedCard({});
	}

	function handleClick(e) {
		if (e.target.classList.contains('popup')) {
			closeAllPopups();
		}
	}

	function handleUpdateUser(inputsValues) {
		api
			.setUser(inputsValues)
			.then((res) => {
				setCurrentUser(res);
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				closeAllPopups();
			});
	}

	function handleUpdateAvatar(newAvatar) {
		api
			.setUserAvatar(newAvatar)
			.then((res) => {
				setCurrentUser(res);
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				closeAllPopups();
			});
	}

	function handleCardLike(card, isLiked) {
		(!isLiked ? api.setLikeCard(card._id) : api.deleteLikeCard(card._id))
			.then((newCard) => {
				const newCards = cards.map((c) => (c._id === card._id ? newCard : c));
				setCards(newCards);
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				closeAllPopups();
			});
	}

	function handleCardDelete(card) {
		setIsConfirmDeletePopupOpen(true);
		setCardToDelete(card);
	}

	function handleAddPlaceSubmit(inputsValues) {
		api
			.setNewCard(inputsValues)
			.then((newCard) => {
				setCards([ newCard, ...cards ]);
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				closeAllPopups();
			});
	}

	function handleDeleteCardSubmit() {
		api
			.deleteCard(cardToDelete._id)
			.then(() => {
				const newCards = cards.filter((c) => c._id !== cardToDelete._id);
				setCards(newCards);
			})
			.catch((err) => {
				console.error(err);
			})
			.finally(() => {
				closeAllPopups();
				setCardToDelete({});
			});
	}

	return (
		<div className="root">
			<div className="page">
				<CurrentUserContext.Provider value={currentUser}>
					<Header />
					<Main
						onEditProfile={handleEditProfileClick}
						onAddPlace={handleAddPlaceClick}
						onEditAvatar={handleEditAvatarClick}
						onCardClick={handleCardClick}
						cards={cards}
						onCardLike={handleCardLike}
						onCardDelete={handleCardDelete}
					/>
					<Footer />
					<ImagePopup
						card={selectedCard}
						onClose={closeAllPopups}
						isOpen={isImagePopupOpen}
						onEscClose={handleClick}
					/>
					<EditProfilePopup
						isOpen={isEditProfilePopupOpen}
						onClose={closeAllPopups}
						onEscClose={handleClick}
						onUpdateUser={handleUpdateUser}
					/>
					<EditAvatarPopup
						isOpen={isEditAvatarPopupOpen}
						onClose={closeAllPopups}
						onEscClose={handleClick}
						onUpdateAvatar={handleUpdateAvatar}
					/>
					<ConfirmDeletePopup
						isOpen={isConfirmDeletePopupOpen}
						onClose={closeAllPopups}
						onEscClose={handleClick}
						onDeleteCard={handleDeleteCardSubmit}
					/>

					<AddPlacePopup
						isOpen={isAddPlacePopupOpen}
						onClose={closeAllPopups}
						onEscClose={handleClick}
						onAddPlace={handleAddPlaceSubmit}
					/>
				</CurrentUserContext.Provider>
			</div>
		</div>
	);
}

export default App;
