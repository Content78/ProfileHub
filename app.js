// --- 1. CONNECT TO SUPABASE ---
const SUPABASE_URL = 'https://owqapmpccqvgtytdyfzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWFwbXBjY3F2Z3RkeXR5Znp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY1NDEsImV4cCI6MjA3NzQxMjU0MX0.YDhPLWBOX1CrlB1urLCu38f557l-aGsjGEiDAODJdHI';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// --- 2. GET ALL OUR HTML ELEMENTS ---

// Auth Containers
const authContainer = document.getElementById('auth-container');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Auth Links
const showSignupLink = document.getElementById('show-signup-link');
const showLoginLink = document.getElementById('show-login-link');

// Login Elements
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

// Signup Elements
const signupEmailInput = document.getElementById('signup-email');
const signupPasswordInput = document.getElementById('signup-password');
const signupButton = document.getElementById('signup-button');

// Password Toggles
const passwordToggles = document.querySelectorAll('.toggle-password');

// Dashboard Container
const dashboardContainer = document.getElementById('dashboard-container');
const logoutButton = document.getElementById('logout-button');

// Dashboard "Add Link" Form
const addLinkTitleInput = document.getElementById('link-title');
const addLinkUrlInput = document.getElementById('link-url');
const addLinkButton = document.getElementById('add-link-button');

// Dashboard "Links List"
const linksList = document.getElementById('links-list');


// --- 3. HELPER FUNCTIONS ---

// Shows the dashboard and hides the auth forms
function showDashboard() {
    authContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    fetchLinks(); // Load the user's links as soon as we show the dashboard
}

// Shows the auth form and hides the dashboard
function showAuth() {
    dashboardContainer.style.display = 'none';
    authContainer.style.display = 'block';
}

// Renders a single link item in the list
function renderLink(link) {
    const linkDiv = document.createElement('div');
    linkDiv.className = 'link-item';
    linkDiv.innerHTML = `
        <span>${link.title}</span>
        <button class="delete-link-button" data-id="${link.id}">Delete</button>
    `;
    linksList.appendChild(linkDiv);
}

// --- 4. MAIN APP LOGIC ---

// Get all links for the current user from Supabase
async function fetchLinks() {
    linksList.innerHTML = '<p>Loading links...</p>'; // Show loading message

    const { data: links, error } = await _supabase
        .from('links')
        .select('*');

    if (error) {
        console.error('Error fetching links:', error.message);
    } else {
        linksList.innerHTML = ''; // Clear loading message
        if (links.length === 0) {
            linksList.innerHTML = '<p>You have no links yet. Add one!</p>';
        } else {
            links.forEach(renderLink); // Add each link to the page
        }
    }
}

// --- 5. EVENT LISTENERS ---

// Toggle between Login and Signup forms
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
});

// Password "Show/Hide" toggles
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const inputId = toggle.dataset.target;
        const passwordInput = document.getElementById(inputId);
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggle.textContent = 'Hide';
        } else {
            passwordInput.type = 'password';
            toggle.textContent = 'Show';
        }
    });
});

// Sign Up Button
signupButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        alert('Error signing up: ' + error.message);
    } else {
        alert('Sign up successful! Please check your email to confirm.');
        showLoginLink.click(); // Programmatically click the "Log In" link
    }
});

// Log In Button
loginButton.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        alert('Error logging in: ' + error.message);
    } else {
        // Log in was successful! Show the dashboard.
        showDashboard();
    }
});

// Log Out Button
logoutButton.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) {
        alert('Error logging out: ' + error.message);
    } else {
        showAuth(); // Go back to login screen
    }
});

// Add Link Button
addLinkButton.addEventListener('click', async () => {
    const title = addLinkTitleInput.value;
    const url = addLinkUrlInput.value;

    if (!title || !url) {
        alert('Please enter both a title and a URL.');
        return;
    }

    // Insert the new link into the 'links' table
    const { data, error } = await _supabase
        .from('links')
        .insert({ title: title, url: url });

    if (error) {
        alert('Error adding link: ' + error.message);
    } else {
        // It worked! Clear the inputs and reload the list
        addLinkTitleInput.value = '';
        addLinkUrlInput.value = '';
        fetchLinks();
    }
});

// Delete Link Button (using Event Delegation)
linksList.addEventListener('click', async (e) => {
    // Check if the clicked element is a delete button
    if (e.target.classList.contains('delete-link-button')) {
        const linkId = e.target.dataset.id;
        
        // Ask the user to confirm
        if (!confirm('Are you sure you want to delete this link?')) {
            return;
        }

        const { error } = await _supabase
            .from('links')
            .delete()
            .eq('id', linkId); // Delete the link where id matches

        if (error) {
            alert('Error deleting link: ' + error.message);
        } else {
            fetchLinks(); // Reload the list
        }
    }
});


// --- 6. INITIAL APP LOAD ---

// This function checks if the user is already logged in when the page loads
async function loadApp() {
    const { data: { session } } = await _supabase.auth.getSession();

    if (session) {
        // User is already logged in
        showDashboard();
    } else {
        // User is not logged in
        showAuth();
    }
}

// Run the app load function when the script starts
loadApp(); 