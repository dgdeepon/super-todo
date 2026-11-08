const API_RESPONSE = {
  SUCCESS({ message, data }) {
    return {
      status: true,
      message: message,
      data: { ...data },
    };
  },
  ERROR({ message, data }) {
    return {
      status: false,
      message: message,
      data: { ...data },
    };
  },
};

module.exports = API_RESPONSE;
