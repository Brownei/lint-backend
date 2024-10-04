import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { FirebaseAuthGuard } from 'src/auth/guard/firebase.guard';
import { CurrentUser } from 'src/auth/guard/auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }
  @Get()
  @UseGuards(FirebaseAuthGuard)
  findAll(@CurrentUser('email') email: string) {
    return this.notificationsService.findAll(email);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }
}
