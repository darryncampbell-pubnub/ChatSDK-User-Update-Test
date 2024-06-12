'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Chat, User, Channel } from '@pubnub/chat'

export default function Home () {
  const [chat, setChat] = useState<Chat | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userArray, setUserArray] = useState<User[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [myName, setMyName] = useState('')

  /* Initialization logic */
  useEffect(() => {
    if (chat) return
    async function init () {
      const chat = await Chat.init({
        publishKey: 'pub-c-ef9f10b2-5744-4a2a-ada6-6ce93f08a18d',
        subscribeKey: 'sub-c-90b22125-4118-4eaf-b859-43fb101c71ec',
        userId: 'test-chatsdk0',
        typingTimeout: 5000,
        storeUserActivityTimestamps: true,
        storeUserActivityInterval: 300000 /* 5 minutes */
      })

      setChat(chat)
      setCurrentUser(chat.currentUser)
      setMyName(chat.currentUser.name)
      let tempUsers = []
      for (var i = 0; i < 3; i++) {
        const user =
          (await chat.getUser('test-chatsdk' + i)) ||
          (await chat.createUser('test-chatsdk' + i, {
            name: 'test-chatsdk' + i,
            profileUrl: '/avatars/f/66.jpg'
          }))
        tempUsers.push(user)
      }
      setUserArray(tempUsers)

      const publicChannels = await chat.getChannels({
        filter: `type == 'public'`
      })
      setChannels(publicChannels.channels)

      //  1. Instruct users to join channels on which they are already members
      /*
      await chat
        .getChannels({ filter: `type == 'public'` })
        .then(async channelsResponse => {
          channelsResponse.channels.forEach(async channel => {
            console.log('joining channel ' + channel.id)
            await channel.join(message => {
              //  No listener
            })
          })
        })
      */

      console.log('chat initialized')
    }
    if (userArray && userArray.length == 0) {
      init()
    }
  }, [chat, userArray])

  //  2. Having any kind of Channel.streamUpdatesOn 
  //useEffect(() => {
  //  if (chat && channels.length > 0) {
  //    console.log('streaming channels')
  //    return Channel.streamUpdatesOn(channels, changedChannels => {
  //      console.log('channels updated')
  //    })
  //  }
  //}, [chat, channels])

  useEffect(() => {
    if (!currentUser) return
    return currentUser.streamUpdates(updatedUser => {
      //console.log(updatedUser)
      setMyName(updatedUser.name)
    })
  }, [currentUser])

  useEffect(() => {
    if (!userArray) return
    if (userArray.length == 0) return
    return User.streamUpdatesOn(userArray, updatedUsers => {
      //console.log('Received Users Array Update:')
      //console.log(updatedUsers)
    })
  }, [userArray])

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
        <p className='fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30'>
          My name is: {myName}
        </p>
      </div>
    </main>
  )
}
