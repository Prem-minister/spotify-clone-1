import { useSession } from "next-auth/react";
import {useCallback, useState, useEffect } from "react";
import useSpotify from "../hooks/useSpotify";
import useSongInfo from "../hooks/useSongInfo";
import { currentTrackIdState, isPlayingState } from "../atom/songAtom";
import { useRecoilState } from "recoil";
import { RewindIcon, FastForwardIcon, PauseIcon, PlayIcon, ReplyIcon, VolumeUpIcon, SwitchHorizontalIcon } from "@heroicons/react/solid";
import { HeartIcon, VolumeUpIcon as VolumnDownIcon } from "@heroicons/react/outline";
import {debounce} from 'lodash';

function Player() {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volumn, setVolumn] = useState(50);
    const songInfo = useSongInfo();


    const fetchCurrentSong = () => {
        if (!songInfo) {
            spotifyApi.getMyCurrentPlayingTrack().then(data => {
                console.log("now playing", data.body?.item);
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing);
                })
            });
        }
    }

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if (data.body.is_playing) {
                spotifyApi.pause();
                setIsPlaying(false);
            } else {
                spotifyApi.play();
                setIsPlaying(true);
            }
        })
    }

    useEffect(() => {
        if (spotifyApi.getAccessToken() && !currentTrackId) {
            //fetch the song info
            fetchCurrentSong();
            setVolumn(50);
        }
    }, [currentTrackId, spotifyApi, session])

    useEffect(() => {
        if (volumn > 0 && volumn < 100) {
            debouncedAdjustVolume(volumn);
        }
    }, [volumn])

     const debouncedAdjustVolume = useCallback(
            debounce((volumn)=>{
            spotifyApi.setVolume(volumn).catch((err) => {});
            }, 500), []
     );


    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
            <div className="flex items-center space-x-4">
                <img className="hidden md:inline h-10 w-10" src={songInfo?.album.images?.[0]?.url} alt="" />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>
            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="button" onClick={()=> spotifyApi.shuffle()}/>
                <RewindIcon onClick={() => spotifyApi.skipToPrevious()} className="button" />

                {isPlaying ? (
                    <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
                ) : (
                    <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
                )}

                <FastForwardIcon onClick={() => spotifyApi.skipToNext()} className="button" />
                <ReplyIcon className="button" />
            </div>
            <div className="flex items-center space-x-3 md:space-x-4 justify-end">
                <VolumnDownIcon onClick={() => volumn > 0 && setVolumn(volumn - 10)} className="button" />
                <input className="w-14 md:w-28" type="range" value={volumn} min={0} max={100} onChange={(e) => setVolumn(Number(e.target.value))} />
                <VolumeUpIcon onClick={() => volumn < 100 && setVolumn(volumn + 10)} className="button" />
            </div>

        </div>
    )
}

export default Player
