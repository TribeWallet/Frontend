import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { Box, Text } from '../../../../theme';

interface CommitmentAvatarProps {
  imageUrl: string | null;
  initials: string;
}

export function CommitmentAvatar({ imageUrl, initials }: CommitmentAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Box
      width={48}
      height={48}
      borderRadius="md"
      bg="primaryLight"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {showImage ? (
        <Image
          source={{ uri: imageUrl ?? undefined }}
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          style={{ width: 48, height: 48 }}
          accessible={false}
        />
      ) : (
        <Text variant="bodySmallStrong" color="primary">
          {initials}
        </Text>
      )}
    </Box>
  );
}