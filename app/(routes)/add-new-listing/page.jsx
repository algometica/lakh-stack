"use client";

import GoogleAddressSearch from '@/app/_components/GoogleAddressSearch'
import { Button } from '@/components/ui/button'
import { supabase } from '@/utils/supabase/client';
import { useUser } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'sonner';

function AddNewListing() {
    const [selectedAddress, setSelectedAddress] = useState();
    const [coordinates, setCoordinates] = useState();
    const [loader, setLoader ] = useState(false);
    const { user } = useUser();
    const router = useRouter();

    const nextHandler = async () => {
        setLoader(true)

        let city = ""
        let country = ""

        if (selectedAddress.label.split(", ").length >= 3) {
            city = selectedAddress.label.split(", ").at(-3);
            country = selectedAddress.label.split(", ").at(-1);
        }

        const { data, error } = await supabase
            .from('listing')
            .insert([
                {
                    address: selectedAddress.label,
                    coordinates: coordinates,
                    city: city,
                    country: country,
                    created_by: user?.primaryEmailAddress.emailAddress
                },
            ])
            .select()

        if (data) {
            setLoader(false)
            console.log("New Data Added", data);
            toast.success('New Address added for listing')
            router.replace('/edit-listing/'+data[0].id)
        }
        if (error) {
            setLoader(false)
            console.log('Error!!');
            toast.error("ERROR: Address already taken OR You are trying to create a second listing; a user is only allowed to create one listing per account.");
        }

    }

    return (
        <div className='mt-10 md:mx-56 lg:mx-80'>
            <div className='p-10 flex flex-col gap-5 items-center justify-center'>
                <h2 className='font-bold text-2xl'>Add New Listing</h2>
                <div className='p-10 rounded-lg border w-full shadow-md flex flex-col gap-5'>
                    <h2 className='text-gray-500'>To make your listing unique - Enter listing's <strong>exact address (not just the city name)</strong></h2>
                    <h3 className='text-gray-500'>In case you don't have a business address, enter your residential street address</h3>
                    <GoogleAddressSearch
                        selectedAddress={(value) => setSelectedAddress(value)}
                        setCoordinates={(value) => setCoordinates(value)}
                    />
                    <Button
                        disabled={!selectedAddress || !coordinates || loader}
                        onClick={nextHandler}
                    >   
                        {loader ? <Loader className='animate-spin' />:'Next'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddNewListing