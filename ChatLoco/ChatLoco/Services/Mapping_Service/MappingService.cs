﻿using AutoMapper;
using ChatLoco.Entities.UserDTO;
using ChatLoco.Models.Chatroom_Model;
using ChatLoco.Models.User_Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatLoco.Services.Mapping_Service
{
    public static class MappingService
    {
        public static void InitializeMaps()
        {
            Mapper.Initialize(cfg => cfg.CreateMap<CreateChatroomRequestModel, CreateChatroomResponseModel>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.UserId))
            .ForMember(dest => dest.ParentChatroomId, opt => opt.MapFrom(src => src.ParentChatroomId))
            .ForMember(dest => dest.ChatroomName, opt => opt.MapFrom(src => src.ChatroomName))
            );

            Mapper.Initialize(cfg => cfg.CreateMap<CreateUserRequestModel, CreateUserResponseModel>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            );

            Mapper.Initialize(cfg => cfg.CreateMap<UserDTO, UserModel>()
            .ForMember(dest => dest.Username, opt => opt.MapFrom(src => src.Username))
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            );

        }
    }
}