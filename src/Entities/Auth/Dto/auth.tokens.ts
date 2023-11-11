import { AccessToken } from "../../../Auth/Tokens/token.access.entity"
import { RefreshToken } from "../../../Auth/Tokens/token.refresh.entity"

export type LoginTokens = {
    accessToken: AccessToken,
    refreshToken: RefreshToken
}