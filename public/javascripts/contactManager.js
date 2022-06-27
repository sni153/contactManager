class Model {
  constructor() {}

  // CREATE 
  async addContact() {
    let data = new FormData(document.querySelector('#contact_form'));
    let json = this.convertToJSON(data);
    let init = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      },
      body: json
    }
    try {
      let response = await fetch('/api/contacts/', init);
      if (response.ok) {
        this.onContactListChanged();
      } else (
        alert('Operation to save a contact was unsuccessful.')
      )
    } catch (error) {
      console.log(error);
    }
  }

  // READ
  async getContact(id) {
    try {
      let response = await fetch(`/api/contacts/${id}`);
      let contact = await response.json();
      return contact;
    } catch (error) {
      console.log(error);
    }
  }

  async getContacts() {
    try {
      let response = await fetch('/api/contacts');
      let contacts = await response.json();
      return contacts;
    } catch (error) {
      console.log(error);
    }
  }

  // UPDATE
  async update(id) {
    let data = new FormData(document.querySelector('#contact_form'));
    let json = this.convertToJSON(data);
    let init = {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json; charset=utf-8'
      },
      body: json
    }
    try {
      let response = await fetch(`/api/contacts/${id}`, init);
      if (response.ok) {
        this.onContactListChanged();
      } else {
        alert('Unable to get contact for specified id.')
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  // DELETE
  async deleteContact(id) {
    let init = {
      method: 'DELETE',
    }
    try {
      let response = await fetch(`/api/contacts/${id}`, init);
      if (response.ok) {
        alert(`${id} was successfully deleted.`);
        this.onContactListChanged();
      } else {
        alert(`Could not delete user ${id}`);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // FILTER
  async filterByTag(tag) {
    let contacts = await this.getContacts();
    contacts = contacts.filter(contact => contact.tags.toLowerCase().split(', ').includes(tag.toLowerCase()))
    return contacts;
  }

  async filterBySearch(query) {
    let contacts = await this.getContacts();
    contacts = contacts.filter(({ full_name }) => full_name.toLowerCase().includes(query.toLowerCase()))
    return contacts;
  }

  convertToJSON(data) {
    return JSON.stringify(Object.fromEntries(data));
  }

  bindContactListChanged(callback) {
    this.onContactListChanged = callback;
  }

}

class View {
  constructor() {
    // jquery variables used for jquery convenience methods 
    this.$form = $('#contact_form');
    this.$noContactsMsg = $('#no_contacts_msg');
    this.formTitle = document.querySelector('#contact_form h3');
    this.full_name = document.querySelector('#full_name');
    this.email = document.querySelector('#email');
    this.phone_number = document.querySelector('#phone_number');
    this.tags = document.querySelector('#tags');
    this.searchBar = document.querySelector('#search_bar');
    this.addContactButtons = document.querySelectorAll('.add_contact');
    this.cancelButton = document.querySelector('#cancel_button');
    this.contacts = document.getElementById('contacts');
    this.templates = this.createTemplates();
    this.registerPartialsAndHelpers();
    this.id;
    this.allContacts = document.querySelector('#all_contacts');
    this.validateForm();
  }

  validateForm() {
    // NAME
    let fullName = document.querySelector('#full_name');
    let fullNameError = document.querySelector('#full_name + span.error');
    fullName.addEventListener('blur', e => {
      if (!fullName.validity.valid) {
        showFullNameError();
      }
    })
    fullName.addEventListener('focus', e => {
      fullName.classList.remove('errorOutline');
      fullNameError.textContent = '';
    })
    function showFullNameError() {
      if (fullName.validity.valueMissing) {
        fullNameError.textContent = 'Please enter the name field.';
      } else if (fullName.validity.patternMismatch) {
        fullNameError.textContent = "Name needs to match pattern 'FirstName LastName.'";
      }
      fullName.classList.add('errorOutline')
    }
    // EMAIL
    let email = document.querySelector('#email');
    let emailError = document.querySelector('#email + span.error');
    email.addEventListener('blur', e => {
      if (!email.validity.valid) {
        showEmailError();
      }
    })
    email.addEventListener('focus', e => {
      email.classList.remove('errorOutline');
      emailError.textContent = '';
    })
    function showEmailError() {
      if (email.validity.valueMissing) {
        emailError.textContent = 'Email address is required.';
      } else if (email.validity.patternMismatch) {
        emailError.textContent = "Email needs to match pattern 'someone@example.com'";
      }
      email.classList.add('errorOutline');
    }
    // PHONE
    let phoneNumber = document.querySelector('#phone_number');
    let phoneNumberError = document.querySelector('#phone_number + span.error');
    phoneNumber.addEventListener('blur', e => {
      if (!phoneNumber.validity.valid || phoneNumber.validity.patternMismatch) {
        showPhoneNumberError();
      }
    })
    phoneNumber.addEventListener('focus', e => {
      phoneNumber.classList.remove('errorOutline');
      phoneNumberError.textContent = '';
    })
    function showPhoneNumberError() {
      phoneNumber.classList.add('errorOutline');
      phoneNumberError.textContent = "Please enter the phone field."
    }

    // FORM
    let submit = document.querySelector('#submit');
    let formErrors = document.querySelector('#form_errors');
    submit.addEventListener('click', e => {
      let form = document.querySelector('form');
      let formIsValid = form.checkValidity();
      if (formIsValid) {
        formErrors.textContent = '';
      } else {
        formErrors.textContent = 'Fix errors before submitting this form.';
        let errors = document.querySelectorAll('input:invalid');
        errors.forEach(error => {
          switch (error.id) {
            case 'full_name':
              showFullNameError();
              break;
            case 'email':
              showEmailError();
              break;
            case 'phone_number':
              showPhoneNumberError();
              break;
          }
        })
      }
    })
  }

  displayContacts(contacts) {
    if (contacts.length === 0) {
      this.$noContactsMsg.show();
    } else {
      this.$noContactsMsg.hide();
    }
    // Convert tags property from string to array of strings
    contacts.forEach(contact => {
      if (contact.tags) {
        contact.tags = (contact.tags.split(', '));
      }
    })
    this.$form.hide();
    this.contacts.innerHTML = '';
    this.contacts.insertAdjacentHTML('beforeend', this.templates.contactListTemplate({ contacts }));
  }

  resetContactForm() {
    this.$form[0].reset();
  }

  createTemplates() {
    let contactListHtml = document.getElementById('contact_list_template').innerHTML;
    return {
      contactListTemplate: Handlebars.compile(contactListHtml),
    }
  }
  registerPartialsAndHelpers() {
    let contactHtml = document.getElementById('contact_template').innerHTML;
    Handlebars.registerPartial('contactTemplate', contactHtml);
  }

  bindEditContact(handler) {
    document.addEventListener('click', event => {
      if (event.target.textContent === 'Edit') {
        this.id = (Number(event.target.parentElement.dataset['id']));
        handler(this.id);
        this.formTitle.textContent = 'Edit Contact';
        this.showForm();
      }
    })
  }

  bindSubmit(addHandler, editHandler) {
    let view = this;
    this.$form.on('submit', event => {
      event.preventDefault();
      if (view.formTitle.textContent === 'Create Contact') {
        addHandler();
      } else if (view.formTitle.textContent === 'Edit Contact') {
        editHandler(view.id);
      }
    })
  }

  bindDeleteContact(handler) {
    document.addEventListener('click', event => {
      if (event.target.textContent === 'Delete') {
        let id = (Number(event.target.parentElement.dataset['id']));
        if (confirm('Do you want to delete the contact ?')) {
          handler(id);
        }
      }
    })
  }

  populateEditForm(contact) {
    let { full_name, phone_number, email, tags } = contact;
    this.full_name.value = full_name;
    this.email.value = phone_number;
    this.phone_number.value = email;
    this.tags.value = tags;
  }

  bindAddContactButtons(handler) {
    this.addContactButtons.forEach(button => {
      button.addEventListener('click', event => {
        handler();
      })
    })
  }

  bindTags(handler) {
    this.contacts.addEventListener('click', event => {
      if (event.target.classList.contains('tag')) {
        let tag = event.target.textContent;
        handler(tag);
      }
    })
  }

  bindCancelButton(handler) {
    this.cancelButton.addEventListener('click', event => {
      if (event.target.id === 'cancel_button') {
        handler();
      }
    })
  }

  bindSearchBar(handler) {
    this.searchBar.addEventListener('keyup', event => {
      let query = event.target.value;
      handler(query);
    })
  }

  bindAllContacts(handler) {
    this.allContacts.addEventListener('click', event => {
      handler();
    })
  }

  showForm() {
    this.$form.show();
  }

  hideForm() {
    this.$form.hide();
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Explicit this binding
    this.model.bindContactListChanged(this.onContactListChanged);
    this.view.bindDeleteContact(this.handleDeleteContact);
    this.view.bindAddContactButtons(this.handleAddContactButtons);
    this.view.bindCancelButton(this.handleCancelButton);
    this.view.bindSearchBar(this.handleSearchQuery);
    this.view.bindEditContact(this.handleEditContact);
    this.view.bindSubmit(this.handleAddContact, this.handleUpdateContact);
    this.view.bindTags(this.handleTagClick);
    this.view.bindAllContacts(this.onContactListChanged)

    // Display initial contacts
    this.onContactListChanged();
  }

  onContactListChanged = async () => {
    try {
      let contacts = await this.model.getContacts();
      this.view.displayContacts(contacts);
    } catch (error) {
      console.log(error);
    }
  }

  handleAddContact = () => {
    this.model.addContact();
    this.view.resetContactForm();
  }

  handleEditContact = async (id) => {
    let contact = await this.model.getContact(id);
    this.view.populateEditForm(contact);
  }

  handleUpdateContact = id => {
    this.model.update(id);
  }

  handleDeleteContact = (id) => {
    this.model.deleteContact(id)
  }
  handleAddContactButtons = () => {
    this.view.showForm();
    this.view.resetContactForm();
  }
  handleCancelButton = () => {
    this.view.hideForm();
    this.view.resetContactForm();
  }
  handleSearchQuery = async (query) => {
    let contacts = await this.model.filterBySearch(query);
    this.view.displayContacts(contacts);
  }
  handleTagClick = async (tag) => {
    let contacts = await this.model.filterByTag(tag);
    this.view.displayContacts(contacts);
  }
}

document.addEventListener('DOMContentLoaded', event => {
  const app = new Controller(new Model(), new View());
})