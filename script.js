// Ambil data dari localStorage
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

    // Alert system
    function showAlert(message, type = 'success') {
      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;
      alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
        <span>${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
      `;
      
      document.body.appendChild(alert);
      
      // Show alert
      setTimeout(() => alert.classList.add('show'), 100);
      
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (alert.parentElement) {
          alert.classList.remove('show');
          setTimeout(() => alert.remove(), 300);
        }
      }, 5000);
    }

    // Modal functionality
    const modal = document.getElementById("modal");
    const addButton = document.getElementById("addButton");
    const closeButton = document.getElementsByClassName("close")[0];

    addButton.onclick = function() {
      modal.style.display = "block";
    }

    closeButton.onclick = function() {
      modal.style.display = "none";
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }

    function addBookmark() {
      const title = document.getElementById("modal-title").value.trim();
      const url = document.getElementById("modal-url").value.trim();
      const category = document.getElementById("modal-category").value.trim();
      const tags = document.getElementById("modal-tags").value.split(",").map(t => t.trim()).filter(t => t);
      const description = document.getElementById("modal-description").value.trim();

      if (!title || !url) {
        showAlert("Judul dan URL wajib diisi!", 'error');
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        showAlert("Format URL tidak valid! Pastikan URL dimulai dengan http:// atau https://", 'error');
        return;
      }

      const newBookmark = {
        id: Date.now(),
        title,
        url,
        category,
        tags,
        description,
        date: new Date().toLocaleDateString('id-ID', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };

      bookmarks.push(newBookmark);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
      renderBookmarks();

      // Show success message
      showAlert(`Link "${title}" berhasil ditambahkan!`, 'success');

      // Reset form and close modal
      document.getElementById("modal-title").value = "";
      document.getElementById("modal-url").value = "";
      document.getElementById("modal-category").value = "";
      document.getElementById("modal-tags").value = "";
      document.getElementById("modal-description").value = "";
      modal.style.display = "none";
    }

    function deleteBookmark(id) {
      const bookmark = bookmarks.find(b => b.id === id);
      if (confirm("Apakah Anda yakin ingin menghapus link ini?")) {
        bookmarks = bookmarks.filter(b => b.id !== id);
        localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
        renderBookmarks();
        showAlert(`Link "${bookmark.title}" berhasil dihapus!`, 'warning');
      }
    }

    function renderBookmarks() {
      const list = document.getElementById("bookmarkList");
      const search = document.getElementById("search").value.toLowerCase();
      list.innerHTML = "";

      const filtered = bookmarks.filter(b =>
        b.title.toLowerCase().includes(search) ||
        (b.category && b.category.toLowerCase().includes(search)) ||
        b.tags.some(tag => tag.toLowerCase().includes(search))
      );

      if (filtered.length === 0) {
        if (bookmarks.length === 0) {
          list.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-book-open"></i>
              <h3>Belum ada link yang disimpan</h3>
              <p>Klik tombol "Tambah Link" untuk menambahkan link pertama Anda</p>
            </div>
          `;
        } else {
          list.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-search"></i>
              <h3>Tidak ada hasil ditemukan</h3>
              <p>Coba gunakan kata kunci pencarian yang berbeda</p>
            </div>
          `;
        }
        return;
      }

      filtered.forEach(b => {
        const div = document.createElement("div");
        div.className = "bookmark";
        div.innerHTML = `
          <div class="bookmark-header">
            <a href="${b.url}" target="_blank" class="bookmark-title">
              <i class="fas fa-link"></i> ${b.title}
            </a>
          </div>
          <p class="bookmark-desc">${b.description || "Tidak ada deskripsi"}</p>
          <div class="bookmark-tags">
            ${b.tags.length > 0 ? 
              b.tags.map(t => `<span class="tag">${t}</span>`).join("") : 
              ''}
          </div>
          <div class="bookmark-footer">
            <span class="bookmark-category">${b.category || "Umum"}</span>
             <span style="color: var(--gray); font-size: 0.8rem;">${b.date || ""}</span>
            <button class="delete-btn" onclick="deleteBookmark(${b.id})">
              <i class="fas fa-trash"></i> Hapus
            </button>
          </div>
        `;
        list.appendChild(div);
      });
    }

    // Render awal
    document.addEventListener('DOMContentLoaded', function() {
      renderBookmarks();
      // Show welcome message for first time users
      if (bookmarks.length === 0) {
        setTimeout(() => {
          showAlert("Selamat datang di Modern Save Link! Mulai tambahkan link favorit Anda.", 'success');
        }, 1000);
      }
    });

    // Add Enter key support for form submission
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && modal.style.display === 'block') {
        if (event.target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          addBookmark();
        }
      }
    });
