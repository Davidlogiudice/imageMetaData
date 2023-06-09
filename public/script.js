document.querySelector('#upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const fileInput = document.querySelector('#imageInput');
    const file = fileInput.files[0];
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch('/upload', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        updateImageContainer(); // Refresh the uploaded images
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
  
  function updateImageContainer() {
    const imageContainer = document.querySelector('.image-container');
    imageContainer.innerHTML = '';
  
    fetch('/images')
      .then((response) => response.json())
      .then((images) => {
        images.forEach((image) => {
          const imgElement = document.createElement('img');
          imgElement.src = `uploads/${image}`;
  
          imgElement.addEventListener('click', () => {
            getMetadata(image);
          });
  
          imageContainer.appendChild(imgElement);
        });
      })
      .catch((error) => console.error('Error fetching uploaded images:', error));
  }
  
  function getMetadata(filename) {
    fetch(`/metadata/${filename}`)
      .then((response) => response.json())
      .then((metadata) => displayMetadata(metadata))
      .catch((error) => console.error('Error fetching metadata:', error));
  }
  
  function displayMetadata(metadata) {
    const container = document.querySelector('.metadata-container');
    container.innerHTML = '';
  
    for (const key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        const row = document.createElement('div');
        row.innerHTML = `<strong>${key}:</strong> ${metadata[key]}`;
        container.appendChild(row);
      }
    }
  }
  
  // Update the image container when the page loads
  window.addEventListener('DOMContentLoaded', updateImageContainer);
  
  // Update the image container after successful file upload
  const uploadForm = document.getElementById('upload-form');
  uploadForm.addEventListener('submit', () => {
    setTimeout(updateImageContainer, 500);
  });
  