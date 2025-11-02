// --- 1. CONNECT TO SUPABASE ---
// We use the same keys as our main app.
const SUPABASE_URL = 'https://owqapmpccqvgtytdyfzy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93cWFwbXBjY3F2Z3RkeXR5Znp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzY1NDEsImV4cCI6MjA3NzQxMjU0MX0.YDhPLWBOX1CrlB1urLCu38f557l-aGsjGEiDAODJdHI';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. GET HTML ELEMENTS ---
const userName = document.getElementById('user-name');
const userBio = document.getElementById('user-bio');
const linksContainer = document.getElementById('links-container');

// --- 3. MAIN FUNCTION ---

// This function will run as soon as the page loads
async function loadProfile() {
    // !! IMPORTANT !!
    // This is just a placeholder for now.
    // In the future, we will get the username from the URL.
    // For testing, we will just show ALL links from EVERY user.
    // This is NOT secure, but it lets us test the page.
    
    // We will fix this security hole later.
    
    userName.textContent = '@YourProfile'; // Placeholder name
    userBio.textContent = 'Welcome to my links page!'; // Placeholder bio

    // Fetch all links from the 'links' table
    const { data: links, error } = await _supabase
        .from('links')
        .select('*');

    if (error) {
        console.error('Error fetching links:', error.message);
        linksContainer.innerHTML = '<p>Could not load links.</p>';
    } else {
        if (links.length === 0) {
            linksContainer.innerHTML = '<p>This user has no links yet.</p>';
            return;
        }
        
        // Clear the loading text
        linksContainer.innerHTML = '';
        
        // Create a button for each link
        links.forEach(link => {
            const linkButton = document.createElement('a');
            linkButton.className = 'link-button';
            linkButton.href = link.url; // Set the actual URL
            linkButton.target = '_blank'; // Open in a new tab
            linkButton.textContent = link.title; // Set the button text
            
            linksContainer.appendChild(linkButton);
        });
    }
}

// Run the function
loadProfile(); 
