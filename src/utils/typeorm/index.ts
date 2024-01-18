/* eslint-disable prettier/prettier */
import { Collaborator } from "./entities/Collaborator";
import { Conversation } from "./entities/Conversation";
import { Event } from "./entities/Event";
import { Like } from "./entities/Like";
import { MessageAttachment } from "./entities/Message-Attachment";
import { Message } from "./entities/Message";
import { Post } from "./entities/Post";
import { Profile } from "./entities/Profile";
import { CollaboratorRequest } from "./entities/Collaborator-Request";
import { User } from "./entities/User";
import { ShakeUser } from "./entities/Shake";


const entities = [
    Collaborator,
    Conversation,
    Event,
    Like,
    MessageAttachment,
    Message,
    Post,
    Profile,
    Request,
    User,
    ShakeUser,
]

export default entities;

export {
    Collaborator,
    Conversation,
    Event,
    Like,
    MessageAttachment,
    Message,
    Post,
    Profile,
    CollaboratorRequest,
    User,
    ShakeUser,
}