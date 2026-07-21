/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateShazacinUserNotifications = /* GraphQL */ `
  subscription OnCreateShazacinUserNotifications(
    $notificationId: String
    $color: String
    $createdAt: Int
    $heading: String
    $icon: String
  ) {
    onCreateShazacinUserNotifications(
      notificationId: $notificationId
      color: $color
      createdAt: $createdAt
      heading: $heading
      icon: $icon
    ) {
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
export const onUpdateShazacinUserNotifications = /* GraphQL */ `
  subscription OnUpdateShazacinUserNotifications(
    $notificationId: String
    $color: String
    $createdAt: Int
    $heading: String
    $icon: String
  ) {
    onUpdateShazacinUserNotifications(
      notificationId: $notificationId
      color: $color
      createdAt: $createdAt
      heading: $heading
      icon: $icon
    ) {
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
export const onDeleteShazacinUserNotifications = /* GraphQL */ `
  subscription OnDeleteShazacinUserNotifications(
    $notificationId: String
    $color: String
    $createdAt: Int
    $heading: String
    $icon: String
  ) {
    onDeleteShazacinUserNotifications(
      notificationId: $notificationId
      color: $color
      createdAt: $createdAt
      heading: $heading
      icon: $icon
    ) {
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
