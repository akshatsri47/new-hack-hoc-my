export default function RedirectButton() {
    const handleRedirect = () => {
      window.location.href = 'http://localhost:3000/auth/github'; // Replace with your URL
    };
  
    return (
      <button onClick={handleRedirect}>
        Aut with git
      </button>
    );
}

