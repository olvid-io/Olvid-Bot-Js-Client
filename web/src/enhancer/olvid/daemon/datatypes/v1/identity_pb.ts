import OlvidClient from ".././../../../../OlvidClient";
import { Identity, IdentityDetails, Identity_ApiKey } from "../../../../../gen/olvid/daemon/datatypes/v1/identity_pb";

// noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
class EnhancedIdentity extends Identity {
    /**
     * Updates the identity details (first name, last name, position, company)
     * @param client - The Olvid client instance
     * @param details - Object containing the fields to update
     * @param details.firstName - Optional new first name
     * @param details.lastName - Optional new last name
     * @param details.position - Optional new position/job title
     * @param details.company - Optional new company name
     * @returns Promise that resolves when the update is complete
     */
    public async update(client: OlvidClient, details: { firstName?: string, lastName?: string, position?: string, company?: string }): Promise<void> {
        await client.identityUpdateDetails({
            newDetails: new IdentityDetails({
                firstName: details.firstName,
                lastName: details.lastName,
                company: details.company,
                position: details.position
            })
        });
    }

    /**
     * Removes the photo from this identity
     * @param client - The Olvid client instance
     * @returns Promise that resolves when the photo is removed
     */
    public async removePhoto(client: OlvidClient): Promise<void> {
        await client.identityRemovePhoto({});
    }

    /**
     * Sets an API key for this identity
     * @param client - The Olvid client instance
     * @param apiKey - The API key string to set
     * @returns Promise that resolves to the API key object when set
     */
    public async setApiKey(client: OlvidClient, apiKey: string): Promise<Identity_ApiKey> {
        return await client.identitySetApiKey({ apiKey });
    }

    /**
     * Sets a configuration link for this identity
     * @param client - The Olvid client instance
     * @param configurationLink - The configuration link URL to set
     * @returns Promise that resolves to the API key object when the configuration is applied
     */
    public async setConfigurationLink(client: OlvidClient, configurationLink: string): Promise<Identity_ApiKey> {
        return await client.identitySetConfigurationLink({ configurationLink });
    }
}