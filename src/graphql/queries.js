/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getShazacinMetadataTitles = /* GraphQL */ `
  query GetShazacinMetadataTitles($titleId: ID!) {
    getShazacinMetadataTitles(titleId: $titleId) {
      createdAt
      updatedAt
      titleId
      categories
      actors
      directors
      genre
      previewUrl
      wheretowatch
      publicEnabled
      rated
      released
      runtimeMinutes
      score
      synopsis
      title
      type
      parentId
      chapter
      episode
      season
      writers
      year
      fingerprinting_progress
      images
    }
  }
`;
export const getShazacinMetadataSubItemTitles = /* GraphQL */ `
  query GetShazacinMetadataSubItemTitles(
    $parentId: ID!
    $limit: Int
    $nextToken: String
  ) {
    getShazacinMetadataSubItemTitles(
      parentId: $parentId
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        titleId
        categories
        actors
        directors
        genre
        previewUrl
        wheretowatch
        publicEnabled
        rated
        released
        runtimeMinutes
        score
        synopsis
        title
        type
        parentId
        chapter
        episode
        season
        writers
        year
        fingerprinting_progress
        images
      }
      nextToken
    }
  }
`;
export const getTitleReviews = /* GraphQL */ `
  query GetTitleReviews($searchString: String!) {
    getTitleReviews(searchString: $searchString) {
      status
      fault {
        faultstring
        detail {
          errorcode
        }
      }
      copyright
      has_more
      num_results
      results {
        display_title
        mpaa_rating
        critics_pick
        byline
        headline
        summary_short
        publication_date
        opening_date
        date_updated
        multimedia {
          type
          src
          width
          height
        }
        link {
          type
          url
          suggested_link_text
        }
      }
    }
  }
`;
export const listShazacinMetadataTitles = /* GraphQL */ `
  query ListShazacinMetadataTitles(
    $filter: TableShazacinMetadataTitlesFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinMetadataTitles(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        createdAt
        updatedAt
        titleId
        categories
        actors
        directors
        genre
        previewUrl
        wheretowatch
        publicEnabled
        rated
        released
        runtimeMinutes
        score
        synopsis
        title
        type
        parentId
        chapter
        episode
        season
        writers
        year
        fingerprinting_progress
        images
      }
      nextToken
    }
  }
`;
export const getShazacinMetadataAdTracks = /* GraphQL */ `
  query GetShazacinMetadataAdTracks($trackId: ID!) {
    getShazacinMetadataAdTracks(trackId: $trackId) {
      titleId
      trackId
      name
      narrator
      magic_adjust
      trackPosition
      publicEnabled
    }
  }
`;
export const listShazacinMetadataAdTracks = /* GraphQL */ `
  query ListShazacinMetadataAdTracks(
    $filter: TableShazacinMetadataAdTracksFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinMetadataAdTracks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        titleId
        trackId
        name
        narrator
        magic_adjust
        trackPosition
        publicEnabled
        narratedLanguage
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getShazacinUserFeedback = /* GraphQL */ `
  query GetShazacinUserFeedback($feedbackId: ID!) {
    getShazacinUserFeedback(feedbackId: $feedbackId) {
      feedbackId
      message
      email
      rating
      titleId
    }
  }
`;
export const listShazacinUserFeedbacks = /* GraphQL */ `
  query ListShazacinUserFeedbacks(
    $filter: TableShazacinUserFeedbackFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinUserFeedbacks(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        feedbackId
        message
        email
        rating
        titleId
      }
      nextToken
    }
  }
`;
export const getShazacinUserNotifications = /* GraphQL */ `
  query GetShazacinUserNotifications($notificationId: String!) {
    getShazacinUserNotifications(notificationId: $notificationId) {
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
export const listShazacinUserNotifications = /* GraphQL */ `
  query ListShazacinUserNotifications(
    $filter: TableShazacinUserNotificationsFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShazacinUserNotifications(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
