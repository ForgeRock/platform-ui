export const frTranslations = {
  enduser: {
    user: {
      profile: {
        updateSuccess: 'Votre profil a été mis à jour.',
      },
    },
    sideMenu: {
      profile: 'Profil',
      applications: 'Mes applications en français',
    },
    pages: {
      dashboard: {
        widgets: {
          welcome: {
            editProfile: 'Éditer le profil en français',
          },
        },
      },
      applications: {
        search: 'Rechercher en français',
        title: 'Applications en français',
      },
    },
    overrides: {
      Sendmenewsandupdates: 'Envoyez-moi des nouvelles et des mises à jour',
      Sendmespecialoffersandservices: 'Envoyez-moi des offres spéciales et des services',
    },
  },
  shared: {
    common: {
      connected: 'Connecté',
      cancel: 'Annuler',
      edit: 'Éditer',
      expires: 'Expirééé',
      delete: 'Supprimer',
      reset: 'Réinitialiser',
      placeholders: {
        username: 'Nom d\'utilisateur',
        password: 'Mot de passe',
      },
    },
    sideMenu: {
      dashboard: 'Tableau de bord',
    },
    pages: {
      profile: {
        editPersonalInfo: 'Éditer les informations personnelles en français',
        updateSuccess: 'Profil mis à jour',
        accountSecurity: {
          title: 'Sécurité du compte en français',
          subtitle: 'Gérez votre mot de passe et vos appareils de confiance',
          twoStepVerification: 'Vérification en deux étapes',
          securityQuestions: 'Questions de sécurité',
        },
        editProfile: {
          userDetailsTitle: 'Détails de l\'utilisateur',
          profileImageModal: {
            title: 'Modifier l\'image de profil',
            formHelp: 'Vous pouvez télécharger une image de profil en utilisant le champ ci-dessous',
            imageHelp: 'L\'image sera redimensionnée pour s\'adapter à la boîte de l\'avatar',
            aspectHelp: 'Nous recommandons une image de 200x200 pixels pour une meilleure qualité',
            profileImageUrl: 'URL de l\'image de profil',
            tips: 'Conseils',
          },
        },
        trustedDevices: {
          title: 'Appareils de confiance en français',
          subtitle: 'Les appareils qui ont accédé à votre compte.',
          browser: 'Navigateur',
          cpu: 'Processeur',
          currentDevice: 'Appareil actuel',
          device: 'Appareil',
          editModalTitle: 'Modifier le nom de l\'appareil',
          editModalInput: 'Nom de l\'appareil',
          editSuccess: 'Nom de l\'appareil enregistré',
          googleMapsLocaltionImgAlt: 'Localisation Google Maps',
          os: 'Système d\'exploitation',
          recentActivity: 'Activité récente',
          remove: 'Supprimer l\'appareil',
          removeModalTitle: 'Supprimer {deviceAlias}',
          removeModalText: 'Cela supprimera l\'accès à votre compte depuis cet appareil.',
          removeDeviceError: 'Une erreur est survenue lors de la suppression de l\'appareil.',
          removeSuccess: 'Appareil supprimé',
          updateDeviceAliasError: 'Une erreur est survenue lors de la mise à jour du nom de l\'appareil.',
          loadDevicesError: 'Une erreur est survenue lors de la récupération des appareils.',
          deviceDetails: 'Détails de l\'appareil',
          removeConfirmationMessage: 'Êtes-vous sûr de vouloir supprimer de <strong>{username}’s</strong> profil?',
          unknown: 'Inconnu',
        },
        accountControls: {
          title: 'Contrôles du compte',
          subtitle: 'Téléchargez ou supprimez les données de votre compte.',
          deleteTitle: 'Supprimer le compte',
          deleteSubtitle: 'Supprimez définitivement toutes les données de votre compte.',
          deleteModalTitle: 'Supprimer définitivement votre compte?',
          deleteModalBody: 'Êtes-vous sûr de vouloir supprimer définitivement les données de votre compte?',
          deleteModalWarning: 'Cette action est irréversible.',
          deleteModalButton: 'Supprimer le compte',
          deleteAccountSuccessful: 'Votre compte a été supprimé avec succès.',
          downloadTitle: 'Téléchargez vos données',
          downloadSubtitle: 'Téléchargez les données de votre profil de compte, y compris les informations personnelles, l\'activité du compte, les données des appareils, les accords de confidentialité et de consentement.',
        },
        preferences: {
          title: 'Préférences',
          subtitle: 'Définissez vos préférences de communication.',
        },
        social: {
          title: 'Connexion sociale',
          subtitle: 'Connectez-vous à votre compte en utilisant des fournisseurs d\'identité sociale.',
          notConnected: 'Non connecté',
          sharedWith: 'Partagé avec {providerName}',
          disconnect: 'Déconnecter',
          connect: 'Connecter',
          journeyServiceError: 'Erreur lors de la récupération des mappages de parcours.',
          identityProviderError: 'Erreur lors de la récupération des fournisseurs d\'identité sociale.',
          deleteModalTitle: 'Déconnecter {providerName}?',
          deleteModalBody: 'Êtes-vous sûr de vouloir déconnecter {providerName} en tant que fournisseur d\'identité sociale?',
          disconnectSuccess: '{providerName} déconnecté avec succès.',
          disconnectError: 'Erreur lors de la déconnexion de {providerName} en tant que fournisseur d\'identité sociale.',
        },
        oauthApplications: {
          title: 'Applications autorisées',
          subtitle: 'Applications auxquelles vous avez donné accès à vos informations personnelles.',
          removeConfirmation: '{applicationName} n\'aura plus accès aux données de votre compte.',
          removeConfirmationTitle: 'Révoquer l\'accès au compte pour {applicationName}?',
          removeSuccess: '\'{applicationName}\' supprimé avec succès.',
          revokeAccess: 'Révoquer l\'accès',
          expires: 'Expire: ',
          noApplications: 'Aucune application autorisée',
          sharedWith: 'Partagé avec {applicationName}',
        },
        consent: {
          allow: 'Autoriser',
          allowConsentHeader: 'Autoriser l\'accès',
          accessType: 'Type d\'accès',
          accountAccess: 'Accès au compte',
          authorized: 'Autorisé',
          confirmDeny: '<strong>{mappingName}</strong> n\'aura plus accès à vos données.',
          deny: 'Refuser',
          denyConsentHeader: 'Refuser l\'accès',
          notAuthorized: 'Non autorisé',
          subtitle: 'Contrôlez comment vos données sont partagées avec des tiers.',
          title: 'Partage des données personnelles',
        },
      },
      linkedApplications: {
        noLinkedApplicationsFound: 'Aucune application liée trouvée.',
        errorRetrievingLinkedApplications: 'Une erreur est survenue lors de la récupération des applications liées.',
      },
    },
    overrides: {
      FirstName: 'Prénom',
      LastName: 'Nom de famille',
      EmailAddress: 'Courriel',
    },
  },
};

export const jaTranslations = {
  enduser: {
    sideMenu: {
      profile: 'プロフィール',
      applications: '私のフランス語アプリケーション',
    },
    pages: {
      dashboard: {
        widgets: {
          welcome: {
            editProfile: 'プロフィール編集',
          },
        },
      },
      applications: {
        search: '検索',
        title: 'アプリケーション',
      },
    },
  },
  shared: {
    sideMenu: {
      dashboard: 'ダッシュボード',
    },
    pages: {
      profile: {
        editPersonalInfo: '個人情報の編集',
        accountSecurity: {
          title: 'アカウントのセキュリティ',
        },
        trustedDevices: {
          title: '信頼できる家電製品',
          subtitle: 'アカウントにアクセスしたデバイス.',
        },
      },
    },
  },
};

export const enTranslations = {
  enduser: {
    pages: {
      dashboard: {
        widgets: {
          welcome: {
            editProfile: 'Overriden button',
          },
        },
      },
    },
  },
};
