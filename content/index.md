---
title: index
---

![[me4.jpg]]
Hi! I'm Gonçalo - currently studying Aerospace Engineering at TU Delft. I'm passionate about space, engineering, computers, and anything tech, really. In my free time, I like to [[reading|read]], [[pics|take pictures]] and work on [[projects|side projects]].

Always learning.

Feel free to [reach out to me](contact) if you'd like to discuss any of my projects or collaborate!


<!-- <script>
  // Detect which theme is currently active
  const theme = localStorage.getItem('theme') || 'light'
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))
  // Add logo image div to the page
  const logo = document.createElement('div')
  logo.id = 'logo'
  if (theme === 'light') {
    logo.innerHTML = '<img src='attachments/me/logo_black.png' width='15%'>'
  } else {
    logo.innerHTML = '<img src='attachments/me/logo_white.png' width='15%'>'
  }
  document.body.appendChild(logo)
</script> -->

<div id="logo">
  <img src="attachments/me/logo_white.png" width="15%">
</div>

<script>
  document.addEventListener('themechange', (e) => {
    const logo = document.getElementById('logo').querySelector('img')
    if (e.detail.theme === 'light') {
      logo.src = 'attachments/me/logo_black.png'
    } else {
      logo.src = 'attachments/me/logo_white.png'
    }
  })
</script>