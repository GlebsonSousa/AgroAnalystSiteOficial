 const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const content = document.getElementById('content');

    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
      content.classList.toggle('blurred');
    });

    overlay.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      content.classList.remove('blurred');
    });

    menuBtn.style.display = 'none'; // Garante que o botão do menu esteja visível