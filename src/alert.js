import Swal from "sweetalert2";

export const showAlert = {
  success: (message) => {
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: message,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      background: "#28a745",
      color: "#ffffff",
      iconColor: "#ffffff",
      customClass: {
        popup: "colored-toast",
        title: "colored-toast-title",
        content: "colored-toast-content",
      },
    });
  },

  error: (message) => {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      background: "#dc3545",
      color: "#ffffff",
      iconColor: "#ffffff",
      customClass: {
        popup: "colored-toast",
        title: "colored-toast-title",
        content: "colored-toast-content",
      },
    });
  },

  confirm: async (message) => {
    const result = await Swal.fire({
      icon: "question",
      title: "Konfirmasi",
      text: message,
      showCancelButton: true,
      confirmButtonText: "Ya",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#ffa000",
      cancelButtonColor: "#6c757d",
      background: "#ffffff",
      color: "#333333",
      iconColor: "#ffa000",
      customClass: {
        popup: "custom-popup",
        title: "custom-title",
        content: "custom-content",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      },
    });
    return result.isConfirmed;
  },

  loading: () => {
    Swal.fire({
      title: "Mohon tunggu...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: "#ffffff",
      color: "#333333",
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "loading-popup",
        title: "loading-title",
      },
    });
  },

  close: () => {
    Swal.close();
  },
};

const style = document.createElement("style");
style.textContent = `
  .colored-toast {
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
  }

  .colored-toast-title {
    font-size: 1.1em !important;
    font-weight: 600 !important;
    margin-bottom: 4px !important;
  }

  .colored-toast-content {
    font-size: 0.9em !important;
  }

  .custom-popup {
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
    padding: 24px !important;
  }

  .custom-title {
    font-size: 1.4em !important;
    color: #333333 !important;
    margin-bottom: 12px !important;
  }

  .custom-content {
    color: #666666 !important;
    font-size: 1.1em !important;
  }

  .custom-confirm-button, .custom-cancel-button {
    padding: 12px 24px !important;
    font-size: 1em !important;
    font-weight: 500 !important;
    border-radius: 6px !important;
    transition: transform 0.2s ease !important;
  }

  .custom-confirm-button:hover, .custom-cancel-button:hover {
    transform: translateY(-2px) !important;
  }

  .loading-popup {
    background: rgba(255, 255, 255, 0.95) !important;
    border-radius: 12px !important;
    padding: 24px !important;
  }

  .loading-title {
    color: #666666 !important;
    font-size: 1.2em !important;
    margin-top: 12px !important;
  }

  .swal2-loading {
    border-color: #ffa000 transparent #ffa000 transparent !important;
  }
`;

document.head.appendChild(style);
