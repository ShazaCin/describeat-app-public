/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createShazacinUserFeedback = /* GraphQL */ `
  mutation CreateShazacinUserFeedback(
    $input: CreateShazacinUserFeedbackInput!
  ) {
    createShazacinUserFeedback(input: $input) {
      feedbackId
      message
      email
      rating
      titleId
    }
  }
`;
export const createShazacinUserNotifications = /* GraphQL */ `
  mutation CreateShazacinUserNotifications(
    $input: CreateShazacinUserNotificationsInput!
  ) {
    createShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
    }
  }
`;
export const updateShazacinUserNotifications = /* GraphQL */ `
  mutation UpdateShazacinUserNotifications(
    $input: UpdateShazacinUserNotificationsInput!
  ) {
    updateShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
    }
  }
`;
export const deleteShazacinUserNotifications = /* GraphQL */ `
  mutation DeleteShazacinUserNotifications(
    $input: DeleteShazacinUserNotificationsInput!
  ) {
    deleteShazacinUserNotifications(input: $input) {
      notificationId
      color
      createdAt
      heading
      icon
      imageUrl
      link
      message
      read_time
      title
      TTL
      userId
    }
  }
`;
